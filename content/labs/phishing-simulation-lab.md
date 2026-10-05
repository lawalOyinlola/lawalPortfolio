---
title: "The Phishing Bridge Lab: Run a Campaign, Then Detect It"
description: "A purple-team bridge: build and launch a full phishing campaign on Apple Silicon with GoPhish and MailHog, click it from a second VM so it crosses the network, then detect the same click with custom Wazuh rules mapped to MITRE ATT&CK T1566. No real mail is sent and no real credentials are captured."
date: 2026-10-05
updated: 2026-10-05
tags: [gophish, phishing, social-engineering, purple-team, wazuh, mitre-attack, homelab]
platform: "Self-hosted"
target: "GoPhish + Wazuh"
difficulty: "Medium"
os: "Linux"
categories: [phishing, purple-team, detection]
tools: [GoPhish, MailHog, Docker, Wazuh, Suricata, Go]
cves: []
skills: [social-engineering, phishing-simulation, detection-engineering, siem, mitre-attack]
status: own-lab
series: "Local labs · UTM on Apple Silicon"
order: 3
draft: false
---

> **⚠️ For authorised, educational use only.** This lab runs entirely against invented targets on an isolated network you own. No email ever leaves your machine, and you never capture a real password. Phishing a real person or organisation without written permission and an agreed scope is a crime, regardless of how harmless the pretext looks. The skill you are practising here is seeing the click; use it only where you have permission in writing.

The pentest lab showed the attack. The detection lab built the half that catches it. This one does both in a single exercise: you stand up a phishing campaign, launch it, click it from a second machine so the traffic crosses the network, and then watch the same click fire an alert in the SIEM you already built. That red-and-blue span in one sitting is what people mean by purple team.

It is a bridge module. It does not sit inside the pentest track or the detection track, because it borrows from both: GoPhish and a convincing login page from the offensive side, custom Wazuh rules and MITRE mapping from the defensive side.

<details>
<summary><strong>Module 0: Foundation setup (expand if this is your first lab)</strong></summary>

This lab runs on the shared environment from the [**Foundation lab**](/security/labs/apple-silicon-lab-foundation) and reuses the SIEM from the [**Detection lab**](/security/labs/detection-siem-lab). You need three VMs on the Shared Network:

- **Kali** (ARM64, Virtualize, `192.168.64.2`): runs GoPhish and MailHog, and already carries a **Wazuh agent** from the Detection lab.
- **One target VM** (Emulate, `192.168.64.4`): acts as the victim who opens the phish, exactly the box you attacked in the [pentest lab](/security/labs/building-a-pentest-lab-on-apple-silicon).
- **Ubuntu Server** (ARM64, `192.168.64.3`): the Wazuh manager, indexer, and dashboard.

If you have not built those yet, start with the [Foundation lab](/security/labs/apple-silicon-lab-foundation), then the [Detection lab](/security/labs/detection-siem-lab) so the Wazuh agent on Kali is already reporting. Everything here assumes that agent exists.

</details>

## The rules

These are not optional, and they are the point of the exercise as much as the tooling is.

- **Stay on the isolated Shared Network.** Mail is caught locally by MailHog and never delivered.
- **Use invented targets only.** Every address ends in a `.local` domain that exists only inside your lab. Never enter a real person or a real company.
- **Keep password capture switched off.** You are learning to record that a form was submitted, not to steal secrets.
- **Never type real credentials into a page you reached from a link,** here or anywhere else. Building that reflex is the whole lesson.

## What you are building

Four pieces work together. GoPhish is the phishing framework: it sends the mail, hosts the fake login page, and records who opened, clicked, and submitted. MailHog is a fake mail server that catches every message so nothing leaves the machine. On the defensive side, a Wazuh custom rule fires when someone hits the fake page, and Suricata sees the same click cross the network when you open the phish from a separate VM.

![A purple-team flow: Kali runs GoPhish and MailHog and sends the lure; a second VM opens the inbox and clicks the link, which crosses the network to Kali's phishing page on port 8080; that click is seen twice, as a host log line in gophish.log shipped by the Wazuh agent and as a Suricata network event, and both feed Wazuh rules 100300 and 100301, tagged to MITRE ATT&CK T1566.](/images/labs/phishing-simulation-lab/phishing-flow.svg)

The topology is the familiar three machines, each playing a new part:

| Machine | Address | Role here |
|---|---|---|
| Kali (ARM64) | `192.168.64.2` | Runs GoPhish and MailHog; Wazuh agent ships the GoPhish log |
| Target VM | `192.168.64.4` | The victim: opens the inbox and clicks the link |
| Ubuntu Server | `192.168.64.3` | Wazuh manager, indexer, dashboard |

> **A note on addressing.** This series puts Kali at `192.168.64.2`. The steps below call it `YOUR-KALI-IP` so you can paste your own address; confirm it with `hostname -I` on the Kali box. Always reach the services from your Mac browser using that IP, never `localhost`, because on your Mac `localhost` is the Mac, not the VM.

---

## Part 1: red team, build and launch

### 1. Install the build tools

GoPhish and MailHog both ship x86_64 binaries that will not run on ARM64 Kali, so you build GoPhish from source and run MailHog from its multi-arch container. Install what both need:

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install unzip wget sqlite3 golang-go git docker.io
```

### 2. MailHog, the fake mail server

Use the Docker image, which is multi-arch and handles restart and port mapping in one line:

```bash
sudo systemctl enable --now docker
sudo docker run -d \
  --name mailhog \
  --restart always \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog
```

MailHog now catches mail on port 1025 and serves a web inbox on 8025.

**Checkpoint:** browse to `http://YOUR-KALI-IP:8025` from your Mac and the MailHog inbox loads.

### 3. GoPhish, built from source

The release zip is x86_64, so build the native arm64 binary:

```bash
cd ~
git clone https://github.com/gophish/gophish.git
cd gophish
go build
```

Everything GoPhish needs lives inside `~/gophish/`.

### 4. Configure GoPhish

Replace the default `config.json`. The admin dashboard listens on 3333, the phishing site on 8080:

```bash
cat > ~/gophish/config.json <<'EOF'
{
  "admin_server": {
    "listen_url": "0.0.0.0:3333",
    "use_tls": false,
    "cert_path": "",
    "key_path": "",
    "trusted_origins": []
  },
  "phish_server": {
    "listen_url": "0.0.0.0:8080",
    "use_tls": false,
    "cert_path": "",
    "key_path": ""
  },
  "db_name": "sqlite3",
  "db_path": "gophish.db",
  "migrations_prefix": "db/db_",
  "contact_address": "lab@yourdomain.local",
  "logging": { "filename": "gophish.log", "level": "info" }
}
```

Two choices in there matter. **Port 8080, not 80,** because binding port 80 needs root, and running GoPhish as root creates the database with the wrong owner and you get "attempt to write a readonly database" later. **Logging to a file,** because in Part 2 you point Wazuh at `gophish.log`; the stock config leaves logging blank, and that one line is what makes the blue-team half possible.

### 5. First run, then make it a service

Run it once by hand to build the database and print the one-time admin password:

```bash
cd ~/gophish
./gophish
```

Copy the password from the "Please login with the username admin and the password..." line; it is shown once. Press `Ctrl+C` to stop. **Never run GoPhish with sudo.** Then install it as a service so it comes back on its own (replace `kali` with your username if different):

```bash
sudo tee /etc/systemd/system/gophish.service >/dev/null <<'EOF'
[Unit]
Description=GoPhish Phishing Framework (lab only)
After=network.target docker.service

[Service]
Type=simple
User=kali
WorkingDirectory=/home/kali/gophish
ExecStart=/home/kali/gophish/gophish
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo chown -R kali:kali /home/kali/gophish
sudo systemctl daemon-reload
sudo systemctl enable --now gophish
sudo systemctl status gophish --no-pager
```

**Checkpoint:** the service reads `active (running)`. If it shows `auto-restart`, read `sudo journalctl -u gophish --no-pager -n 40` for the reason, usually ownership or a stray `config.json` typo.

Log in from your Mac at `http://YOUR-KALI-IP:3333` as `admin` with the one-time password, and set a new one. If you hit "Forbidden, CSRF token invalid," open a private window and retry.

### 6. Build the campaign

A GoPhish campaign ties together five parts. Build them in order.

**A. Sending profile.** Under Sending Profiles, New Profile. Name it `IT Helpdesk`, set SMTP From to `no-reply@yourdomain.local`, Host to `YOUR-KALI-IP:1025` (MailHog's intake), and leave username and password blank. Send a test email, then confirm it landed in the MailHog inbox at `http://YOUR-KALI-IP:8025`. Save.

**B. Landing page.** Under Landing Pages, New Page, name it `Portal Login (Lab)`. Click the source button (`< >`), clear the box, and paste a generic staff portal:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Staff Portal</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;min-height:100vh;background:#1D5DBF;
  display:flex;align-items:center;justify-content:center;color:#10285A}
.card{background:#fff;width:430px;max-width:92vw;border-radius:14px;
  padding:46px 44px 32px;box-shadow:0 22px 60px rgba(0,0,0,.30)}
.brand h1{color:#1D5DBF;font-size:28px;font-weight:800;letter-spacing:1px;text-align:center}
.brand .bar{width:66px;height:5px;background:#FFD936;border-radius:3px;margin:12px auto 8px}
.brand p{color:#6b7280;font-size:14px;margin-bottom:28px;text-align:center}
label{display:block;font-size:13px;font-weight:700;color:#10285A;margin:0 0 6px 2px}
.field{margin-bottom:18px}
input{width:100%;padding:14px;font-size:15px;border:1px solid #d1d9e6;
  border-radius:8px;background:#f7f9fc;color:#10285A}
button{width:100%;padding:15px;font-size:16px;font-weight:700;color:#fff;
  background:#1D5DBF;border:none;border-radius:8px;cursor:pointer}
.foot{text-align:center;font-size:12px;color:#9aa4b2;margin-top:24px}
</style>
</head>
<body>
<div class="card">
  <div class="brand"><h1>STAFF PORTAL</h1><div class="bar"></div><p>Sign in to continue</p></div>
  <form method="post">
    <div class="field"><label>Username or Email</label>
      <input type="text" name="username" placeholder="you@yourdomain.local" autocomplete="off"></div>
    <div class="field"><label>Password</label>
      <input type="password" name="password" placeholder="Enter your password" autocomplete="off"></div>
    <button type="submit">Sign in</button>
  </form>
  <div class="foot">Authorized users only.</div>
</div>
</body>
</html>
```

Below the editor, tick **Capture Submitted Data**, leave **Capture Passwords unchecked**, and set **Redirect to** `http://YOUR-KALI-IP:8025` so the victim lands somewhere harmless after submitting. Click **Save Page while still in the source view**; switching back to the visual editor first can rewrite the markup.

**C. Email template.** Under Email Templates, New Template, name it `Password Expiry Notice (Lab)`, subject `Action required: your password expires today`. In source view, paste:

```html
<html>
<body style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
<p>Hi {{.FirstName}},</p>
<p>Our records show your account password expires <b>today</b>. To keep your
  access active, please verify your account using the link below.</p>
<p><a href="{{.URL}}" style="background:#1D5DBF;color:#ffffff;padding:10px 18px;
  text-decoration:none;border-radius:4px;display:inline-block">Verify your account</a></p>
<p>If you do not act today, your access may be suspended.</p>
<p>Regards,<br>IT Helpdesk</p>
{{.Tracker}}
</body>
</html>
```

The three variables do the work: `{{.FirstName}}` greets each target, `{{.URL}}` becomes a unique tracking link so GoPhish knows exactly who clicked (you never type your IP here), and `{{.Tracker}}` is the invisible open-tracking pixel. Because the tracker is already in the HTML, leave the **Add Tracking Image** box unticked. Save.

**D. Users and groups.** Under Users and Groups, New Group, name it `Lab Staff`, and bulk-import invented people. Every address ends in `yourdomain.local`:

```csv
First Name,Last Name,Email,Position
Amara,Okoye,amara.okoye@yourdomain.local,HR Manager
Chidi,Nwosu,chidi.nwosu@yourdomain.local,Lead Tutor
Fatima,Bello,fatima.bello@yourdomain.local,Tutor
Daniel,Eze,daniel.eze@yourdomain.local,Moderator
Kelechi,Obi,kelechi.obi@yourdomain.local,IT Support Lead
Musa,Danjuma,musa.danjuma@yourdomain.local,Admin Officer
Ngozi,Umeh,ngozi.umeh@yourdomain.local,Finance Officer
```

**E. Launch.** Under Campaigns, New Campaign, name it `Demo Phishing`, and select the template, landing page, sending profile, and group you just built. For **URL**, type `http://YOUR-KALI-IP:8080`. Use **http, not https**: the lab server speaks plain http, and a running campaign's URL cannot be edited, so a mistyped https means completing it and starting over. Click **Launch Campaign**.

### 7. Walk the kill chain from the victim VM

This is the step that makes the blue team possible. Instead of clicking your own link on Kali, open the phish from the **target VM** so the request crosses the network and Suricata can see it.

1. On the **target VM** (not Kali), browse to `http://YOUR-KALI-IP:8025` to reach MailHog's inbox.
2. Open one of the phishing emails and click the link. The fake login page loads from Kali on port 8080.
3. Enter a **fake** username and a **fake** password, and submit.
4. On the GoPhish dashboard (`http://YOUR-KALI-IP:3333`), watch the rings fill: Email Sent, Email Opened, Clicked Link, Submitted Data. Expand a name to see its timeline, and open Submitted Data to see the captured username. The password field is blank because you kept capture off.

**The lesson in one sentence:** the fake site already has the username, and with password capture on it would have the password too. That is why you never enter real credentials on a page you reached from a link.

---

## Part 2: blue team, detect the phish

You now have a working campaign. This half wires it into the Wazuh SIEM from the [Detection lab](/security/labs/detection-siem-lab), so the same click that fills GoPhish's rings also raises an alert.

### 1. Confirm the Wazuh agent on Kali

The Detection lab already put an agent on Kali. Confirm it is running:

```bash
sudo systemctl status wazuh-agent --no-pager
```

If there is no agent yet, install one following the Detection lab's agent step, pointing it at `192.168.64.3`.

### 2. Ship the GoPhish log

Tell the agent to collect `gophish.log` by adding a localfile block to its config, then make the file readable and restart:

```bash
sudo tee -a /var/ossec/etc/ossec.conf >/dev/null <<'EOF'

<!-- GoPhish campaign log -->
<ossec_config>
  <localfile>
    <log_format>json</log_format>
    <location>/home/kali/gophish/gophish.log</location>
  </localfile>
</ossec_config>
EOF

sudo chmod 644 /home/kali/gophish/gophish.log
sudo systemctl restart wazuh-agent
```

### 3. Write the detection rules

SSH into the Wazuh server and open the local rules file:

```bash
sudo nano /var/ossec/etc/rules/local_rules.xml
```

Add two rules. GoPhish writes JSON log lines; rule 100300 fires on a landing-page visit, 100301 on a credential submission, and both map to MITRE ATT&CK T1566 so they land in the matrix view you know from the Suricata work:

```xml
<group name="gophish,phishing_lab,">

  <!-- Someone visited the GoPhish landing page -->
  <rule id="100300" level="10">
    <decoded_as>json</decoded_as>
    <field name="message">Landing page visited</field>
    <description>Phishing lab: landing page visited by a target</description>
    <mitre>
      <id>T1566</id>
    </mitre>
  </rule>

  <!-- Someone submitted credentials on the landing page -->
  <rule id="100301" level="12">
    <decoded_as>json</decoded_as>
    <field name="message">Credentials submitted</field>
    <description>Phishing lab: credentials submitted on fake login page</description>
    <mitre>
      <id>T1566</id>
    </mitre>
  </rule>

</group>
```

> **Rule IDs must be unique across the server.** If another lab already uses the 100300 block, shift these to the next free pair (100310, 100311). Restart the manager after editing: `sudo systemctl restart wazuh-manager`.

### 4. Test it end to end

1. On the **target VM**, open MailHog and click a link you have not opened yet.
2. Submit the fake form.
3. On the Wazuh dashboard, open **Threat Hunting** and filter for rule IDs 100300 and 100301.

**Checkpoint:** two alerts appear, one for the visit and one for the submission, both tagged T1566, carrying the victim VM's source IP. If Suricata is running on the target from the Detection lab, the same HTTP request to Kali's port 8080 also shows as a network event, giving you the host view (the GoPhish log) and the network view (Suricata) of one click.

### 5. What to look for

Three views tell the whole story, and the pair of them side by side is the artifact worth keeping:

- **Threat Hunting:** your 100300 and 100301 alerts with the victim's source IP.
- **MITRE ATT&CK:** T1566 now lights up in the matrix, next to the techniques you triggered from the other labs.
- **GoPhish dashboard:** the same timeline from the attacker's side, rings filling as the victim moves through the funnel.

---

## Cleanup

When you are done, complete or delete the campaign so the dashboard is clean, and optionally stop the services between sessions:

```bash
sudo systemctl stop gophish
sudo docker stop mailhog
```

Leave the Wazuh rules in place. They stay quiet unless GoPhish is running and writing log lines, so they add no noise.

---

## Appendix: troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `bind: permission denied` on port 80 | Config still on port 80 | Rewrite `config.json` for port 8080 (step 4) |
| `attempt to write a readonly database` | GoPhish was run with sudo, or ownership is wrong | `sudo chown -R kali:kali ~/gophish`; never use sudo |
| GoPhish binary will not execute | Downloaded the x86_64 release | Delete it and `go build` from source (step 3) |
| MailHog container will not start | Docker not running | `sudo systemctl start docker`, then `sudo docker start mailhog` |
| "CSRF token invalid" on login | Stale browser cookie | Open a private window |
| Phish link fails with an SSL error | Campaign URL typed as https | Complete it, create a new campaign with `http://YOUR-KALI-IP:8080` |
| No Wazuh alerts | Agent not shipping the log, or permissions wrong | Check the localfile block, `chmod 644` the log, restart the agent |
| Rule IDs conflict | Another lab already uses 100300-100301 | Shift to the next free block (100310+) |

---

## Where this sits

This is the purple-team hinge of the local series: it reuses the [pentest lab's](/security/labs/building-a-pentest-lab-on-apple-silicon) topology for the attack and the [Detection lab's](/security/labs/detection-siem-lab) SIEM for the catch, and it adds T1566 to your MITRE coverage. What you can show afterwards is the thing a defender and an attacker rarely have from the same person: one campaign, launched and detected, evidenced on both sides.

The track that builds on this next is the **AI-augmented SOC** (planned): layering Grafana dashboards, network inventory, and AI-assisted triage on top of the growing pile of alerts, so the question shifts from "did we detect it" to "how fast can we read it."

See how the tracks connect on the [interactive labs map](/security/labs).
