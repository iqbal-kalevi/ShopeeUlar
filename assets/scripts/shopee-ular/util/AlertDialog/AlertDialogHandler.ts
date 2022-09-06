import {
  _decorator,
  Component,
  Node,
  Color,
  game,
  tween,
  Vec3,
  UITransform,
  UIOpacity,
} from "cc";
import { AlertDialogItem } from "./AlertDialogItem";
const { ccclass, property } = _decorator;

@ccclass("AlertDialogHandler")
export class AlertDialogHandler extends Component {
  @property({ type: AlertDialogItem })
  private alertDialogItem: AlertDialogItem;
  @property({ type: UIOpacity })
  private overlay: UIOpacity;
  @property({ type: Node })
  private targetPosition: Node;

  private tweenDuration = 1;

  onLoad() {
    this.alertDialogItem.node.active = false;
    this.overlay.node.active = false;

    const targetPosUITransform = this.targetPosition.getComponent(UITransform);
    const alertDialogItemUITransform =
      this.alertDialogItem.node.getComponent(UITransform);
    targetPosUITransform.setContentSize(alertDialogItemUITransform.contentSize);
    targetPosUITransform.setAnchorPoint(alertDialogItemUITransform.anchorPoint);

    game.on(ALERT_DIALOG_EVENT.DISPLAY, this.displayAlertDialog, this);
    game.on(ALERT_DIALOG_EVENT.CLOSE, this.closeAlertDialog, this);
  }

  private displayAlertDialog(alertDialogOption?: AlertDialogOption) {
    this.alertDialogItem.setupItem(alertDialogOption);
    this.alertDialogItem.node.active = true;
    this.overlay.node.active = true;

    this.alertDialogItem.node.position = new Vec3(0, 0, 0);
    this.overlay.opacity = 0;

    tween(this.overlay)
      .to(this.tweenDuration, { opacity: 100 }, { easing: "expoOut" })
      .start();

    tween(this.alertDialogItem.node)
      .to(
        this.tweenDuration,
        { worldPosition: this.targetPosition.worldPosition },
        { easing: "elasticOut" }
      )
      .start();
  }

  private closeAlertDialog() {
    this.alertDialogItem.onAlertDialogClose();

    tween(this.overlay)
      .to(this.tweenDuration/1.2, { opacity: 0 }, { easing: "quadIn" })
      .call(() => {
        this.overlay.node.active = false;
      })
      .start();

    tween(this.alertDialogItem.node)
      .to(this.tweenDuration/1.2, { position: Vec3.ZERO }, { easing: "elasticIn" })
      .call(() => {
        this.alertDialogItem.node.active = false;
      })
      .start();
  }
}

export function displayAlertDialog(alertDialogOption: AlertDialogOption) {
  game.emit(ALERT_DIALOG_EVENT.DISPLAY, alertDialogOption);
}

export function closeAlertDialog() {
  game.emit(ALERT_DIALOG_EVENT.CLOSE);
}

export class AlertDialogOption {
  public readonly title: string;
  public readonly body: string;
  public readonly buttonOptions: Array<AlertDialogButtonOption>;

  constructor(
    title?: string,
    body?: string,
    buttonOptions?: Array<AlertDialogButtonOption>
  ) {
    this.title = title;
    this.body = body;
    this.buttonOptions = buttonOptions;
  }
}

export class AlertDialogButtonOption {
  public readonly text: string;
  public readonly color: Color;
  public readonly callback: () => void;
  public readonly closeOnClick: boolean;

  constructor(
    text: string,
    color?: Color,
    closeOnClick?: boolean,
    callback?: () => void
  ) {
    this.text = text;
    this.color = color == undefined ? Color.WHITE : color;
    this.closeOnClick = closeOnClick == undefined ? true : closeOnClick;
    this.callback = callback == undefined ? () => {} : callback;
  }
}

export enum ALERT_DIALOG_EVENT {
  DISPLAY = "ALERT_DIALOG_DISPLAY",
  CLOSE = "ALERT_DIALOG_CLOSE",
}
