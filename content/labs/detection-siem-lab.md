---
title: "The Detection & SIEM Lab: Catching the Attack with Wazuh"
description: "The defensive mirror of the pentest lab: a Wazuh SIEM on the Ubuntu Server box, with agent logs from Kali and the target, Suricata network detection, and VirusTotal file-integrity monitoring. Run the pentest attacks against your own detection and watch one rule auto-delete a malicious file."
date: 2026-10-05
updated: 2026-10-05
tags: [wazuh, suricata, siem, blue-team, defensive, virustotal, homelab]
cover: /images/labs/detection-siem-lab/alert-chain.png
coverAlt: "The Wazuh Threat Hunting dashboard showing the full detection chain in order: a file added to /root, a VirusTotal alert flagging it as malicious at level 12, and the file deleted seconds later."
platform: "Self-hosted"
target: "Wazuh SIEM stack"
difficulty: "Medium"
os: "Linux"
categories: [detection, siem, blue-team]
tools: [Wazuh, Suricata, VirusTotal, "Emerging Threats rules", nmap, Hydra, jq]
cves: []
skills: [siem, intrusion-detection, file-integrity-monitoring, threat-intel, incident-response]
status: own-lab
series: "Local labs · UTM on Apple Silicon"
order: 2
draft: false
---

The pentest lab showed what an attacker does. This one builds the half that catches them. You stand up a Wazuh SIEM on the Ubuntu Server box from the foundation, ship logs from Kali and the target into it, add network intrusion detection with Suricata and file-integrity monitoring enriched with VirusTotal, and then run the same attacks from the pentest track against your own detection. By the end, a scan, a brute-force, and a dropped malware sample each raise an alert you can read, and one of them cleans itself up.

This is the defensive mirror. Every offensive move in the pentest lab has a detection here, and the point of the whole exercise is to see the attack and the alert side by side.

<details>
<summary><strong>Module 0: Foundation setup (expand if this is your first lab)</strong></summary>

This lab runs on the shared environment from the [**Foundation lab**](/security/labs/apple-silicon-lab-foundation). You need three VMs on the Shared Network:

- **Ubuntu Server** (ARM64, Virtualize, `192.168.64.3`): this becomes the Wazuh host.
- **Kali** (ARM64, Virtualize, `192.168.64.2`): the first agent, and the attacker later.
- **A monitored endpoint** (a modern 64-bit Ubuntu VM at `192.168.64.4`): the second agent, where Suricata and file-integrity monitoring run, and the victim in the capstone. Metasploitable 2 is too old to run a current Wazuh agent or Suricata, so stand up a fresh Ubuntu here rather than reusing the pentest target.

If you have not built those yet, the full walkthrough with every gotcha is in the [Foundation lab](/security/labs/apple-silicon-lab-foundation). Snapshot the endpoint while it is clean before you start.

</details>

## What you are building

Wazuh is a single platform wearing three hats: a **manager** that collects and analyses events, an **indexer** that stores them, and a **dashboard** that shows them. Agents on each endpoint ship host logs to the manager. On top of that, Suricata reads the wire and reports network events, and file-integrity monitoring watches sensitive directories and checks any new file against VirusTotal. Everything lands in one dashboard.

![The detection pipeline: Wazuh agents on Kali and the target ship host logs to the manager, indexer and dashboard on the Ubuntu Server box; Suricata feeds network alerts through the target's agent; and file-integrity events are enriched by VirusTotal, with an active response that deletes confirmed malware.](/images/labs/detection-siem-lab/detection-pipeline.svg)

The three detection layers you will end up with, and the attack each one catches:

| Layer | Watches | Catches |
|---|---|---|
| Network (Suricata) | Traffic on the endpoint's interface | Port and version scans |
| Host (Wazuh agent) | Auth and system logs | SSH brute-force, logins |
| FIM + VirusTotal | Sensitive directories | Malware written to disk |

---

## 1. Install Wazuh

Wazuh ships an assisted installer that stands up the manager, indexer, and dashboard on one node. Run it on the **Ubuntu Server** VM.

SSH in from your Mac, then download and run the installer:

```bash
sudo apt update
curl -sO https://packages.wazuh.com/4.14/wazuh-install.sh
sudo bash ./wazuh-install.sh -a
```

The `-a` flag is the all-in-one install. It prints the admin password at the end; copy it, because it is shown once. The install takes a few minutes and is memory-hungry, which is why the foundation gives this box 6 GB.

**Open the dashboard** from your Mac browser at `https://192.168.64.3` (accept the self-signed certificate warning). Log in as `admin` with the password the installer printed.

**Checkpoint:** the dashboard loads and shows zero agents. That is expected; you add them next.

> **If the dashboard is unreachable or read-only later:** the indexer locks itself read-only when its disk fills. Free space, then restart the three services in order (`wazuh-indexer`, `wazuh-manager`, `wazuh-dashboard`). This is the single most common way the stack gets stuck.

---

## 2. Deploy the agents

An agent is architecture-specific, so match the package to each host's architecture: Kali is ARM64, and the Ubuntu endpoint is whatever you built it as.

| Endpoint | Package |
|---|---|
| Kali (`192.168.64.2`) | `wazuh-agent` **aarch64** `.deb` |
| Ubuntu endpoint (`192.168.64.4`) | `wazuh-agent` matching its arch (**amd64** if x86_64, **aarch64** if ARM64) |

On the dashboard, open **Agents → Deploy new agent**, pick the OS and architecture, and set the manager address to `192.168.64.3`. The dashboard generates the exact install command, including the enrolment key. Run it on the endpoint, then enable and start the service:

```bash
# Example shape; use the command the dashboard generates for each host
wget https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.14.x-1_ARCH.deb
sudo WAZUH_MANAGER="192.168.64.3" dpkg -i ./wazuh-agent_4.14.x-1_ARCH.deb

sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```

**Verify** on the dashboard: both agents show **Active**.

> **Kali logs to journald, not `/var/log/auth.log`.** The agent already reads journald by default, so do not add a duplicate localfile block for auth on Kali, or you will double-count events.

**Checkpoint:** Agents page shows Kali and the endpoint as Active, with a recent keep-alive.

---

## 3. Suricata IDS

Suricata gives you the network layer. Install it on the **Ubuntu endpoint** so it sees traffic on the lab network, then feed its events into that host's Wazuh agent.

**Install from the stable PPA.** On a minimal Ubuntu, `add-apt-repository` is not present until you install `software-properties-common`, so add it first:

```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:oisf/suricata-stable
sudo apt-get update
sudo apt-get install suricata -y
suricata -V
```

**Download the Emerging Threats open ruleset:**

```bash
cd /tmp/
curl -LO https://rules.emergingthreats.net/open/suricata-6.0.8/emerging.rules.tar.gz
sudo tar -xvzf emerging.rules.tar.gz
sudo mkdir -p /etc/suricata/rules
sudo mv rules/*.rules /etc/suricata/rules/
```

**Edit `/etc/suricata/suricata.yaml`** so it knows your network and where the rules live:

```yaml
HOME_NET: "[192.168.64.0/24]"
EXTERNAL_NET: "any"

default-rule-path: /etc/suricata/rules
rule-files:
  - "*.rules"

af-packet:
  - interface: enp0s1   # your lab interface; check with `ip addr`
```

> **Duplicate `HOME_NET` / `EXTERNAL_NET` keys fail silently.** The stock file already defines them once. Edit the existing lines rather than adding new ones; a duplicate key does not error, it just quietly misconfigures the engine.

**Test the config, then start it:**

```bash
sudo suricata -T -c /etc/suricata/suricata.yaml   # -T = test only
sudo systemctl restart suricata
sudo systemctl status suricata
```

**Point the agent at Suricata's event log** by adding a localfile block to the endpoint's `/var/ossec/etc/ossec.conf`, inside `<ossec_config>`:

```xml
<localfile>
  <log_format>json</log_format>
  <location>/var/log/suricata/eve.json</location>
</localfile>
```

Restart the agent so it picks up the new log:

```bash
sudo systemctl restart wazuh-agent
```

**Checkpoint:** `sudo tail /var/log/suricata/eve.json` shows JSON events, and the Wazuh dashboard starts showing Suricata-sourced alerts under the endpoint's agent.

---

## 4. VirusTotal file-integrity monitoring

This is the layer the pentest lab does not have an equivalent for, and it is the most satisfying one: the SIEM watches sensitive directories, and when a new file appears it checks the file's hash against VirusTotal and, if any engine flags it as malicious, deletes it automatically.

**Register for a free API key** at virustotal.com and copy your key from your profile. The free tier is rate-limited, which is fine for a lab.

**On the Ubuntu endpoint**, tell FIM to watch `/root` in real time, the directory the auto-delete will act on. The stock `<syscheck>` block already watches the system directories (`/etc`, `/usr/bin`, `/bin`, and so on); add one line to it in `/var/ossec/etc/ossec.conf`:

```xml
<syscheck>
  <!-- ...the stock entries stay as they are... -->
  <directories realtime="yes">/root</directories>
</syscheck>
```

`realtime="yes"` means a file dropped in `/root` is normally caught as it is written rather than waiting for the next scheduled scan, which is what makes the detect-and-delete feel instant. One caveat: Wazuh pauses realtime monitoring while a scheduled FIM scan is running, so a drop during a scan is caught once that scan finishes rather than at the instant it lands.

Three pieces go **on the manager**, and together they make the chain. First, two custom rules in `/var/ossec/etc/rules/local_rules.xml` that fire when a file is added to or modified in `/root`. They build on Wazuh's base FIM rules, where 550 is "file modified" and 554 is "file added":

```xml
<group name="syscheck,">

  <!-- A file was modified in /root -->
  <rule id="100200" level="7">
    <if_sid>550</if_sid>
    <field name="file">^/root/</field>
    <description>File modified in /root</description>
  </rule>

  <!-- A file was added to /root -->
  <rule id="100201" level="7">
    <if_sid>554</if_sid>
    <field name="file">^/root/</field>
    <description>File added to /root</description>
  </rule>

</group>
```

Next, the VirusTotal integration in `/var/ossec/etc/ossec.conf`, pointed at those two rules with `<rule_id>` so a hash lookup only happens when something lands in `/root`, not on every file event on the box. That keeps you comfortably inside the free tier:

```xml
<integration>
  <name>virustotal</name>
  <api_key>YOUR_VT_API_KEY</api_key>
  <rule_id>100200,100201</rule_id>
  <alert_format>json</alert_format>
</integration>
```

When VirusTotal returns a malicious verdict, Wazuh's built-in rule **87105** fires. Wire the active response to that rule, also in the manager's `ossec.conf`:

```xml
<command>
  <name>remove-threat</name>
  <executable>remove-threat.sh</executable>
  <timeout_allowed>no</timeout_allowed>
</command>

<active-response>
  <command>remove-threat</command>
  <location>local</location>
  <rules_id>87105</rules_id>
</active-response>
```

So the chain reads top to bottom: a file lands in `/root` (rule 100201), that triggers the VirusTotal lookup, a malicious verdict raises the built-in rule 87105, and 87105 fires the response. Rule 87105 fires on any positive count, so the script deletes on any confirmed-malicious verdict rather than waiting for a threshold. If you want a minimum number of engines before it acts, add your own rule on top of 87105 and point the active response at that instead.

That `<location>local</location>` is the detail that trips people up: the response runs on the agent where the alert fired, which is the endpoint where the file actually sits, not on the manager. So the blocks above live on the manager, but the script they name has to be installed on the endpoint. Restart the manager now so it loads the integration, the rules, and the active-response config:

```bash
sudo systemctl restart wazuh-manager
```

**Create the removal script on the endpoint** at `/var/ossec/active-response/bin/remove-threat.sh`. It reads the alert from stdin, pulls the flagged file path with `jq`, and deletes it. Because it runs as root and the path comes from the alert, it refuses to touch anything outside `/root`, and it fails safe if `jq` is missing or the alert has no path:

```bash
#!/bin/bash
# Active response: delete a file VirusTotal confirmed malicious.
# Runs on the endpoint as root, so it only ever deletes inside /root.
LOG="/var/ossec/logs/active-responses.log"
read INPUT_JSON

# jq does the JSON parsing; refuse to run blind if it is missing
command -v jq >/dev/null 2>&1 || {
  echo "$(date '+%Y/%m/%d %H:%M:%S') remove-threat: FAIL jq not installed" >> "$LOG"; exit 1; }

# Pull the flagged file path out of the alert; empty if it is not there
FILE=$(printf '%s' "$INPUT_JSON" | jq -r '.parameters.alert.data.virustotal.source.file // empty' 2>/dev/null)
[ -n "$FILE" ] || {
  echo "$(date '+%Y/%m/%d %H:%M:%S') remove-threat: FAIL no file path in alert" >> "$LOG"; exit 1; }

# Only ever delete inside /root; refuse anything else and leave it for a human
case "$FILE" in
  /root/*) ;;
  *) echo "$(date '+%Y/%m/%d %H:%M:%S') remove-threat: REFUSED path outside /root: $FILE" >> "$LOG"; exit 1 ;;
esac

# Delete, then confirm the file is actually gone before logging success
if rm -f "$FILE" && [ ! -e "$FILE" ]; then
  echo "$(date '+%Y/%m/%d %H:%M:%S') remove-threat: OK deleted $FILE" >> "$LOG"
else
  echo "$(date '+%Y/%m/%d %H:%M:%S') remove-threat: FAIL could not delete $FILE" >> "$LOG"
fi
exit 0
```

> **Why the delete is limited to `/root`.** The script runs `rm` as root on a path that came from the alert. Restricting it to `/root`, the one directory you watch in real time for drops, means a malformed or misdirected alert can only ever target files there, never somewhere like `/etc`. Anything else is logged as `REFUSED` and left for a human. If you want to watch and auto-clean another directory, add it to both `<syscheck>` and the `case`, deliberately.

Install `jq`, set ownership and permissions, and restart the agent so it picks up the script, all **on the endpoint**:

```bash
sudo apt-get install jq -y
sudo chown root:wazuh /var/ossec/active-response/bin/remove-threat.sh
sudo chmod 750 /var/ossec/active-response/bin/remove-threat.sh
sudo systemctl restart wazuh-agent
```

**Test it with EICAR**, the standard harmless antivirus test string that every engine flags. On the endpoint, drop it into a watched directory. Writing to `/root` needs root, so pipe it through `sudo tee`:

```bash
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' | sudo tee /root/eicar.txt >/dev/null
```

**Watch the chain fire** on the dashboard: FIM rule 100201 fires (file added to `/root`), that triggers the VirusTotal lookup, the built-in rule 87105 raises the malicious verdict, and the active response deletes `/root/eicar.txt`. Confirm the deletion and the log:

```bash
cat /var/ossec/logs/active-responses.log
ls -la /root/eicar.txt   # should be gone
```

**Checkpoint:** `active-responses.log` shows an `OK deleted /root/eicar.txt` line, and the file is gone.

The reason this counts as evidence rather than a screenshot of a dashboard is the alert document itself. Expand the VirusTotal alert and you get the fields the verdict was built on: the file path, its MD5 and SHA1, how many engines flagged it, and a permalink back to the VirusTotal report.

![The expanded Wazuh alert document for the VirusTotal rule, showing the data.virustotal fields: the flagged file path, its MD5 and SHA1 hashes, a positives count of 64, the total engine count, and a permalink to the VirusTotal report.](/images/labs/detection-siem-lab/virustotal-enrichment.png)

---

## 5. Attack and detect

Now run the pentest track's attacks against your own detection. This is the capstone: the same commands, now generating alerts instead of just access.

**Network layer: scan from Kali.** From the [pentest lab](/security/labs/building-a-pentest-lab-on-apple-silicon) you already know this scan. Run it at the target:

```bash
# From Kali
nmap -sV 192.168.64.4
```

On the dashboard, the target agent shows Suricata **ET SCAN** alerts (Nmap service scan, version probes). The network layer caught the recon.

**Host layer: SSH brute-force from Kali.** Point Hydra at SSH the way the pentest lab does. On the dashboard, the host layer raises authentication-failure alerts, and a burst of them is the brute-force signature. Two independent layers now describe the same attack: Suricata saw the packets, the agent saw the failed logins.

**FIM + VirusTotal: drop a suspicious file.** Simulate malware landing on the box after a compromise. The response script only auto-deletes inside `/root`, so a realistic post-compromise drop (an attacker who already has root) goes there. On the endpoint:

```bash
# On the endpoint, as root
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' | sudo tee /root/eicar.txt >/dev/null
```

FIM catches the write, VirusTotal confirms it, and the response deletes it, logging `OK deleted /root/eicar.txt`, all without you touching the dashboard.

To see the guard itself, feed the script an alert that points outside `/root`. This is a direct test of the active-response script, not a FIM event, because a file in an unwatched directory never reaches VirusTotal in the first place:

```bash
# On the endpoint: hand the script a crafted alert for a path outside /root
echo '{"command":"add","parameters":{"alert":{"data":{"virustotal":{"source":{"file":"/tmp/canary"}}}}}}' \
  | sudo /var/ossec/active-response/bin/remove-threat.sh
sudo tail -n1 /var/ossec/logs/active-responses.log   # REFUSED path outside /root: /tmp/canary
```

That `REFUSED` line is the blast-radius limit working: even a confirmed-malicious verdict cannot make the script delete outside `/root`. That is the full detect-and-respond loop, with a deliberate cap on what the automated `rm` will touch.

**Checkpoint:** the dashboard's **Threat Hunting** and **MITRE ATT&CK** views show the scan, the brute-force, and the file event, each mapped to a technique.

> **Skip the VirusTotal parts** if you did not set up section 4. The scan and brute-force detection still work on their own; the FIM auto-delete is the only piece that needs the integration.

---

## 6. Daily operations

- **Start order:** bring up the Wazuh server first, give it a minute, then the endpoints, then open the dashboard. The agents reconnect on their own.
- **Snapshot after every milestone.** The same `qemu-img snapshot` discipline from the foundation applies here: snapshot the Wazuh server once it is installed and configured, before you start breaking things, so a bad config change is a rollback rather than a reinstall.
- **Watch the indexer's disk.** Log data grows; when the disk fills, the indexer goes read-only and the dashboard stops updating. Free space and restart the three services.

---

## Appendix: troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Dashboard unreachable after it worked | Indexer went read-only on a full disk | Free space, restart `wazuh-indexer`, `wazuh-manager`, `wazuh-dashboard` |
| Agent stuck "Never connected" | Wrong manager IP, or the agent cannot reach `192.168.64.3` | Check `WAZUH_MANAGER`, confirm both VMs are on Shared Network |
| Suricata will not start | Duplicate `HOME_NET`/`EXTERNAL_NET`, or a rule-path typo | `suricata -T -c ...` to test; delete duplicate keys |
| No Suricata alerts in Wazuh | Agent not reading `eve.json` | Confirm the localfile block and restart the agent |
| VirusTotal rules never fire | API key wrong, rate-limited, or syscheck not watching the path | Check the manager logs; confirm the file landed in a watched directory |
| EICAR file not deleted | Script not on the endpoint, not executable, wrong owner, or `jq` missing | On the endpoint: `chmod 750`, `chown root:wazuh`, install `jq`, restart the agent |

---

## Appendix: Screenshot checklist

Capture these as you go; the alert-chain and the rings-plus-verdict frames are the portfolio artifacts, and the config shots are what make the write-up evidence rather than assertion. Filenames follow `det-<n>` so a sorted folder reads in lab order.

| Screenshot ID | What it shows | Status |
|---|---|---|
| `det-1` | Wazuh dashboard loaded after install, zero agents | <input type="checkbox" data-shot-id="det-1" /> |
| `det-2` | Agents page: Kali and the endpoint both Active | <input type="checkbox" data-shot-id="det-2" /> |
| `det-3` | Endpoint: `suricata -V` and `tail eve.json` showing JSON events | <input type="checkbox" data-shot-id="det-3" /> |
| `det-4` | Dashboard: Suricata alerts under the endpoint agent | <input type="checkbox" data-shot-id="det-4" /> |
| `det-5` | `/root` realtime `<syscheck>` entry and the `100200`/`100201` rules | <input type="checkbox" data-shot-id="det-5" /> |
| `det-6` | Manager `ossec.conf`: VirusTotal integration + active-response blocks | <input type="checkbox" data-shot-id="det-6" /> |
| `det-7` | `remove-threat.sh` on the endpoint (the `/root` guard visible) | <input type="checkbox" data-shot-id="det-7" /> |
| `det-8` | `active-responses.log` showing `OK deleted /root/eicar.txt` | <input type="checkbox" data-shot-id="det-8" /> |
| `det-9` | Threat Hunting: the full chain, file added → VirusTotal verdict → file deleted | <input type="checkbox" data-shot-id="det-9" /> |
| `det-10` | The expanded VirusTotal alert document (file, hashes, positives, permalink) | <input type="checkbox" data-shot-id="det-10" /> |
| `det-11` | `active-responses.log` showing `REFUSED path outside /root` from the guard test | <input type="checkbox" data-shot-id="det-11" /> |
| `det-12` | Capstone: Suricata `ET SCAN` alerts from the `nmap` scan | <input type="checkbox" data-shot-id="det-12" /> |
| `det-13` | Capstone: host-layer authentication-failure alerts from the Hydra brute-force | <input type="checkbox" data-shot-id="det-13" /> |
| `det-14` | MITRE ATT&CK matrix with the triggered techniques lit | <input type="checkbox" data-shot-id="det-14" /> |

---

## Lab status

The detection stack is built and running end to end: Wazuh manager, indexer, and dashboard on the Ubuntu Server box, agents on Kali and the endpoint, Suricata on the endpoint, and the VirusTotal file-integrity auto-delete verified against EICAR with the `/root` guard confirmed. The phishing bridge and the AI-augmented SOC build on this same SIEM.

---

## Where this sits

This lab is the blue-team counterpart to the [pentest lab](/security/labs/building-a-pentest-lab-on-apple-silicon): the attacks you ran there are the events you detect here. It also sets up the two tracks that build on a working SIEM:

- **Phishing bridge** (planned): run a phishing campaign and write the custom Wazuh rules that detect it, a purple-team exercise that reuses this exact stack.
- **AI-augmented SOC** (planned): layer network inventory, Grafana dashboards, and AI-assisted alert triage on top of the detection you built here.

See how the tracks connect on the [interactive labs map](/security/labs).
