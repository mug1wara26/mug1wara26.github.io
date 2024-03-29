import * as chalModel from '../model/chalModel'
import * as ctfModel from '../model/ctfModel'
import express, {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {BasicUser} from "../types/userTypes";
import {IsOptional, validate} from "class-validator";
import {BasicChallenge, Challenge} from "../types/chalTypes";
import {CTF} from "../types/ctfTypes";
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const chalRouter = express.Router();


chalRouter.post('/create', async (req, res) => {
    if (!req.body.challenge) return  res.status(400).end();
    const token = req.header('Authorization')
    if (token) {
        jwt.verify(token, SECRET_KEY!, (err, decoded) => {
            if (err) {
                res.statusMessage = 'Invalid token'
                return res.status(400).end()
            }
            else {
                const user = decoded as BasicUser
                const chal = new Challenge()
                Object.assign(chal, req.body.challenge)

                validate(chal).then(errors => {
                    if (errors.length > 0) return res.status(400).json(errors)
                    else {
                        validateChalCreation(chal, user.username, (status: number, statusMessage: string) => {
                            if (status === 200) {
                                chalModel.create(chal, (err: Error) => {
                                    if (err) return res.status(400).end()
                                    else {
                                        const {flag, ...basicChal} = chal
                                        return res.status(200).json(basicChal)
                                    }
                                })
                            }
                            else {
                                res.statusMessage = statusMessage
                                res.status(status).end()
                            }
                        })
                    }
                })

            }
        })
    }
    else return res.status(400).end()
})

chalRouter.get('/:ctfid/:name', async (req, res) => {
    const id = req.params.ctfid
    const name = req.params.name
    const token = req.header('Authorization')

    if (token) {
        jwt.verify(token, SECRET_KEY!, (err, decoded) => {
            if (err) {
                res.statusMessage = 'Invalid token'
                return res.status(400).end()
            }
            else {
                const user = decoded as BasicUser
                // Whether user can get challenge is covered by the sql query
                chalModel.findOneByUser(id, name, user.username, (err: Error, chal: BasicChallenge) => {
                    if (err) return res.status(500).end()
                    else return res.status(200).json({challenge: chal})
                })
            }
        })
    }
    else return res.status(400).end()
})

chalRouter.post('/getChalUserData', async (req, res) => {
    const ctfid = req.body.ctfid
    const chalName = req.body.chalName
    const token = req.header('Authorization')

    if (token && ctfid && chalName) {
        jwt.verify(token, SECRET_KEY!, (err, decoded) => {
            if (err) {
                res.statusMessage = 'Invalid token'
                return res.status(400).end()
            }
            else {
                const user = decoded as BasicUser

                chalModel.findOneByUser(ctfid, chalName, user.username, (err: Error, chal: BasicChallenge) => {
                    if (err) return res.status(500).end()
                    else if (chal) {
                        ctfModel.findOne(ctfid, (err: Error, ctf: CTF) => {
                            if (err) return res.status(500).end()
                            else if (ctf) {
                                chalModel.isSolved(ctfid, chalName, user.username, (err: Error, isSolved: boolean) => {
                                    return res.status(200).json({challenge: chal, isPublic: ctf.public, isSolved: isSolved})
                                })
                            }
                            else return res.status(400).end()
                        })
                    }
                    else return res.status(400).end()
                })
            }
        })
    }
    else return res.status(400).end()
})

chalRouter.post('/solve', async (req, res) => {
    const ctfid = req.body.ctfid
    const chalName = req.body.chalName
    const submittedFlag = req.body.flag
    const token = req.header('Authorization')

    if (token && ctfid && chalName && submittedFlag) {
        jwt.verify(token, SECRET_KEY!, (err, decoded) => {
            if (err) {
                res.statusMessage = 'Invalid token'
                return res.status(400).end()
            }
            else {
                const user = decoded as BasicUser

                chalModel.getFlag(ctfid, chalName, user.username, (err: Error, flag: string) => {
                    if (err) return res.status(500).end();
                    else if (flag) {
                        if (flag === submittedFlag) {
                            chalModel.solve(ctfid, chalName, user.username, (err:Error) => {
                                if (err) return res.status(500).end()
                                else return res.status(200).json({solved: true})
                            })
                        }
                        else return res.status(200).json({solved: false})
                    }
                    else return res.status(400).end()
                })
            }
        })
    }
    else return res.status(400).end()
})

const validateChalCreation = (chal: Challenge, username: string, callback: Function) => {
    ctfModel.memberOfTeamCreator(username, chal.ctfid, (err: Error, isMember: boolean) => {
        if (err) return callback(500, 'Internal server error')
        if (isMember) {
            chalModel.findCTFChals(chal.ctfid, (err: Error, chals: Array<Challenge>) => {
                if (chals.length >= 100) return callback(400, 'Bad request')
                else return callback(200)
            })
        }
        else return callback(400, 'Bad request')
    })
}

export {chalRouter}