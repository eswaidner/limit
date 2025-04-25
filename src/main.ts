import { Limit } from "./limit";
import "./style.css";

Limit.load(`
INIT_FLAG = 1

INIT
jeq [INIT_FLAG] 1 -> UPDATE

# set init flag
add 1 0 -> INIT_FLAG

# init [2] to 10
add 10 0 -> 2

# screen pixel count
mul 480 270 -> 4

# step counter
add 0 0 -> 0

UPDATE
add 1 [0] -> 0

add 0 0 -> 3   # reset draw counter

set 0xFFFFFFFF [4] -> 0
`);

Limit.start();
