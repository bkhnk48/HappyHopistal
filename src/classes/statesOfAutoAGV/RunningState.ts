import { Actor } from "../actor";
import { Text } from "../text";
import { Graph } from "../graph";
import { Nodee, StateOfNodee } from "../node";
import { HybridState } from "./HybridState";
import { AutoAgv } from "../AutoAgv";
import { IdleState } from "./IdleState";
const PriorityQueue = require("priorityqueuejs");

export class RunningState extends HybridState {
    public _isLastMoving? : boolean;
    private _agvIsDestroyed? : boolean;

    constructor(isLastMoving : boolean = false) {
        super();
        this._isLastMoving = isLastMoving;
        this._agvIsDestroyed = false;
    }

    public move(agv: AutoAgv): void {
        if(this._agvIsDestroyed) //|| this._isEliminated)
            return;
        // nếu không có đường đi đến đích thì không làm gì
        if (!agv.path) {
            return;
          }
        // nếu đã đến đích thì không làm gì
        if (agv.cur == agv.path.length - 1) {
            agv.setVelocity(0, 0);
            if(this._isLastMoving){
                this._agvIsDestroyed = true;
                agv.destroy();
                return;
            }
            else{
                agv.hybridState = new IdleState(performance.now());
            }
            return;
        }
        // nodeNext: nút tiếp theo cần đến
        let nodeNext: Nodee =
        agv.graph.nodes[agv.path[agv.cur + 1].x][agv.path[agv.cur + 1].y];
        /**
         * nếu nút tiếp theo đang ở trạng thái bận
        * thì Agv chuyển sang trạng thái chờ
        */
        if (nodeNext.state == StateOfNodee.BUSY) {
            agv.setVelocity(0, 0);
            if (agv.waitT) return;
            agv.waitT = performance.now();
            } else {
            /**
             * nếu Agv từ trạng thái chờ -> di chuyển
                * thì cập nhật u cho node hiện tại
                */
            if (agv.waitT) {
                agv.curNode.setU((performance.now() - agv.waitT) / 1000);
                agv.waitT = 0;
            }
            // di chuyển đến nút tiếp theo
            if (
                Math.abs(agv.x - nodeNext.x * 32) > 1 ||
                Math.abs(agv.y - nodeNext.y * 32) > 1
            ) {
                agv.scene.physics.moveTo(agv, nodeNext.x * 32, nodeNext.y * 32, 32);
            } else {
                /**
                 * Khi đã đến nút tiếp theo thì cập nhật trạng thái
                * cho nút trước đó, nút hiện tại và Agv
                */
                agv.curNode.setState(StateOfNodee.EMPTY);
                agv.curNode = nodeNext;
                agv.curNode.setState(StateOfNodee.BUSY);
                agv.cur++;
                agv.setX(agv.curNode.x * 32);
                agv.setY(agv.curNode.y * 32);
                agv.setVelocity(0, 0);
                agv.sobuocdichuyen++;
                // cap nhat lai duong di Agv moi 10 buoc di chuyen;
                // hoac sau 10s di chuyen
                if (
                agv.sobuocdichuyen % 10 == 0 ||
                performance.now() - agv.thoigiandichuyen > 10000
                ) {
                    agv.thoigiandichuyen = performance.now();
                    agv.cur = 0;
                    agv.path = agv.calPathAStar(agv.curNode, agv.endNode);
                }
            }
        }
  
    }
}