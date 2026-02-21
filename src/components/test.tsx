import { PROJECTS } from "@/app/constants/projects"

function Projects() {
    return (
        <section className="wrapper min-h-screen flex flex-col gap-4.5 justify-center">
            <h1 className="font-semibold tracking-tight uppercase">Projects</h1>
            <div className="flex items-center gap-12.5 p-4.5 pl-0 title tracking-tighter">
                <div>01.</div>
                <div>02.</div>
                <div>03.</div>
                <div>04.</div>
            </div>
            {PROJECTS.map((project, index) => (
                <div key={index} className="flex justify-center flex-col gap-10">
                    <div className="flex-center gap-4.5 py-4.5 *:basis-1/2">
                        {/* Project Image */}
                        <div className="bg-green-400 h-80" />
                        <div className="flex flex-col h-80 justify-between">
                            <h2>{project.name}</h2>
                            <p>{project.description}</p>
                        </div>
                    </div>
                    <div className="flex-center gap-10">{
                        project.tags.map((tag, i) => (<div key={i} className="flex flex-col">
                            <div className="size-2 bg-background" />
                            <p>
                                {tag}
                            </p>
                        </div>))}</div>
                </div>
            ))}
        </section>
    )
}

export default Projects;