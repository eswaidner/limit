import { Limit } from "./limit";
import "./style.css";

Limit.load(`
INIT:
jeq x1, 1, UPDATE

# set x1 to 1 (init flag)
add 1, 0, 1

# init x2 to 2
add 2, 0, 2

UPDATE:
add 1, x2, 2
add 255, 0, x2
`);

Limit.start();
