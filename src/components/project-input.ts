import { Component } from "./base-component";
import { autobind } from "../decorators/autobind.decorator";
import { projectState } from "../state/project-state";

//Class ProjectInput
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
