function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const orignalMethod = descriptor.value;

  const adjMethod: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = orignalMethod.bind(this);
      return boundFn;
    },
  };
  return adjMethod;
}

//Drag and Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum Status {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: Status
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

//Project State class
//Singleton class i.e only one instance can be created (private constructor)
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      Component;
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      Status.Active
    );

    this.projects.push(newProject);
    this.listenerFn();
  }

  moveProject(projectId: string, newStatus: Status) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.listenerFn();
    }
  }

  listenerFn() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateElementId: string,
    hostElementId: string,
    attachAtbeginning: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateElementId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(attachAtbeginning);
  }

  private attach(attachAtbeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      attachAtbeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons `;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.element.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent): void {
    console.log("DragEnd");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);

    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

//Class ProjectList
class ProjectLists
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

//Class ProjectInput
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;
  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
    this.peopleInput = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.descriptionInput = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.configure();
  }

  renderContent() {}

  configure() {
    // this.element.addEventListener('submit',this.submitHandler.bind(this));
    this.element.addEventListener("submit", this.submitHandler);
  }

  private validate(): [string, string, number] | void {
    if (
      this.titleInput.value.toString().trim().length == 0 ||
      this.peopleInput.value.toString().trim().length == 0 ||
      this.descriptionInput.value.toString().trim().length == 0
    ) {
      alert("Invalid Credentials , Try Again !");
      return;
    } else {
      return [
        this.titleInput.value,
        this.descriptionInput.value,
        +this.peopleInput.value,
      ];
    }
  }

  private resetValues() {
    this.titleInput.value = "";
    this.descriptionInput.value = "";
    this.peopleInput.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.validate();
    if (Array.isArray(userInput)) {
      const [titleInput, descriptionInput, peopleInput] = userInput;
      // console.log(titleInput, descriptionInput, peopleInput);
      projectState.addProject(titleInput, descriptionInput, peopleInput);
      this.resetValues();
    }
  }
}
const Project1 = new ProjectInput();

const activeProjectList = new ProjectLists("active");
const finishedProjectList = new ProjectLists("finished");
