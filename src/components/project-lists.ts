import {Component} from './base-component.js'
import {Project} from '../models/project-model'
import { DragTarget } from '../models/drag-drop-interfaces.js';
import { autobind } from '../decorators/autobind.decorator.js';
import { Status } from '../models/project-model';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item';

//Class ProjectList
export class ProjectLists
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  private assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
    }
    const ListEl = this.element.querySelector("ul")!;
    ListEl.classList.add("droppable");
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const projId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projId,
      this.type === "active" ? Status.Active : Status.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    const ListEl = this.element.querySelector("ul")!;
    ListEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
      const filteredProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === Status.Active;
        }
        return prj.status === Status.Finished;
      });
      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const proItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, proItem);
    }
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + ` PROJECTS`;
  }
}
