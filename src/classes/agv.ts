import { Tilemaps } from "phaser";
import { Actor } from "./actor";
import { Text } from "./text";

export class Agv extends Actor {
  private text: Text;
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private pathLayer: Tilemaps.TilemapLayer;
  private isImmortal: boolean = false; // biến cần cho xử lý overlap =))
  private isDisable: boolean = false; // biến cần cho xử lý overlap =))

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pathLayer: Tilemaps.TilemapLayer
  ) {
    super(scene, x, y, "agv");
    this.pathLayer = pathLayer;
    this.text = new Text(this.scene, this.x, this.y - this.height * 0.5, "AGV");
    // KEYS
    this.keyW = this.scene.input.keyboard.addKey("W");
    this.keyA = this.scene.input.keyboard.addKey("A");
    this.keyS = this.scene.input.keyboard.addKey("S");
    this.keyD = this.scene.input.keyboard.addKey("D");

    // PHYSICS
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
  }

  private getTilesWithin(): Tilemaps.Tile[] {
    return this.pathLayer.getTilesWithinWorldXY(this.x, this.y, 31, 31);
  }

  update(): void {
    this.getBody().setVelocity(0);
    this.text.setPosition(this.x, this.y - this.height * 0.5);

    if (this.isDisable) return;

    let t, l, b, r;
    t = true;
    l = true;
    b = true;
    r = true;

    let tiles = this.getTilesWithin();
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].properties.direction == "top") {
        b = false;
        if (this.keyS?.isDown) {
          this.text
            .setTint(0xfff0000)
            .setText("Can't Go")
            .setX(this.x - 20);
        } else {
          this.text.clearTint().setText("AGV");
        }
      }
      if (tiles[i].properties.direction == "left") {
        r = false;
        if (this.keyD?.isDown) {
          this.text
            .setTint(0xfff0000)
            .setText("Can't Go")
            .setX(this.x - 20);
        } else {
          this.text.clearTint().setText("AGV");
        }
      }
      if (tiles[i].properties.direction == "bottom") {
        t = false;
        if (this.keyW?.isDown) {
          this.text
            .setTint(0xfff0000)
            .setText("Can't Go")
            .setX(this.x - 20);
        } else {
          this.text.clearTint().setText("AGV");
        }
      }
      if (tiles[i].properties.direction == "right") {
        l = false;
        if (this.keyA?.isDown) {
          this.text
            .setTint(0xfff0000)
            .setText("Can't Go")
            .setX(this.x - 20);
        } else {
          this.text.clearTint().setText("AGV");
        }
      }
    }

    // console.log("t: ", t, " ", "r: ", r, " ", "b: ", b, " ", "l: ", l);

    if (this.keyW?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      if (t) {
        this.body.velocity.y = -32;
      }
    }

    if (this.keyA?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      if (l) {
        this.body.velocity.x = -32;
      }
    }

    if (this.keyS?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      if (b) {
        this.body.velocity.y = 32;
      }
    }

    if (this.keyD?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      if (r) {
        this.body.velocity.x = 32;
      }
    }
  }

  public handleOverlap() {
    if (!this.isImmortal) {
      this.isDisable = true;
      setTimeout(() => {
        this.isImmortal = true;
        this.isDisable = false;
        setTimeout(() => {
          this.isImmortal = false;
        }, 2000);
      }, 1000);
    }
  }
}
