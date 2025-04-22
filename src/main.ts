import { Limit } from "./limit";
import "./style.css";

Limit.load(`
# LIMIT
add x0, 1, 1
jeq 0, 0, END

END:
`);

Limit.start();
