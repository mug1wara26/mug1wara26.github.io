import express from "express";
import * as bodyParser from "body-parser";
import {userRouter} from "./routes/userRouter";
// @ts-ignore
import cors from "cors";
import {create, findUserTeams} from "./model/teamModel";
import {teamRouter} from "./routes/teamRouter";


const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use("/users", userRouter);
app.use("/teams", teamRouter)

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});