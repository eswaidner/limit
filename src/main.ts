import { Limit } from "./limit";
import "./style.css";

Limit.load(`
INIT_FLAG = 1

INIT
jeq [1] 1 -> UPDATE

# set init flag
add 1 0 -> INIT_FLAG

# init [2] to 2
add 2 0 -> 2

UPDATE
add 1 [2] -> 2
add 0xFFFFFFFF 0 -> [2]
`);

Limit.start();
