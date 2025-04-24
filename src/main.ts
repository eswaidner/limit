import { Limit } from "./limit";
import "./style.css";

Limit.load(`
INIT:
jeq [1] 1 -> UPDATE

# set [1] to 1 (init flag)
add 1 0 -> 1

# init [2] to 2
add 2 0 -> 2

UPDATE:
add 1 [2] -> 2
add 0xFFFFFFFF 0 -> [2]
`);

Limit.start();
