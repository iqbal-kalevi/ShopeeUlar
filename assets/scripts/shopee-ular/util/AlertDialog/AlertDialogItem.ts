import { _decorator, Component, Node, Label, Button, game } from "cc";
import {
  AlertDialogButtonOption,
  AlertDialogOption,
  ALERT_DIALOG_EVENT,
  closeAlertDialog,
} from "./AlertDialogHandler";
const { ccclass, property } = _decorator;

@ccclass("AlertDialogItem")
export class AlertDialogItem extends Component {
  @property({ type: Label })
  private titleLabel: Label;
  @property({ type: Label })
  private bodyLabel: Label;
  @property({ type: Button })
  private firstButton: Button;
  @property({ type: Button })
  private secondButton: Button;
  private buttons: Array<Button>;

  public setupItem(alertDialogOption: AlertDialogOption) {
    this.setTitle(alertDialogOption.title);
    this.setBody(alertDialogOption.body);
    this.setButtons(alertDialogOption.buttonOptions);
  }

  private setTitle(title: string) {
    this.titleLabel.string = title;
  }

  private setBody(body: string) {
    this.bodyLabel.string = body;
  }

  private setButtons(alertDialogButtonOptions: Array<AlertDialogButtonOption>) {
    this.buttons = [];
    this.buttons.push(this.firstButton);
    this.buttons.push(this.secondButton);

    this.buttons.forEach((button) => {
      button.node.on(Node.EventType.TOUCH_END, () => {});
      button.enabled = true;
      button.node.active = false;
    });

    alertDialogButtonOptions.forEach((option, i) => {
      if (i >= 2) return;

      const button: Button = this.buttons[i];
      button.node.active = true;
      button.getComponentInChildren(Label).string = option.text;
      button.normalColor = option.color;

      button.node.on(Node.EventType.TOUCH_END, () => {
        if (option.closeOnClick) {
            closeAlertDialog();
          }
        option.callback();
      });
    });
  }

  public onAlertDialogClose(){
    this.buttons.forEach((button) => {
        button.enabled = false;
      });
  }
}
