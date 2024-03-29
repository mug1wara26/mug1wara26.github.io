import {db} from "../db";
import {RowDataPacket} from "mysql2";

export const searchByPage = (table: string, search: string, page_num: number, callback: Function) => {
    let queryString = ''
    let appendString = ''
    let numRowsQuery = 'SELECT COUNT(*)'
    if (table === 'user') queryString = 'SELECT username, displayName, email, pfp, bio'
    else if (table === 'writeup') queryString = 'SELECT writeup.*, note.title, note.content, note.chalName, note.ctfid'
    else if (['ctf', 'team'].includes(table)) queryString = 'SELECT *'

    if (table === 'writeup') {
        appendString += '\nFROM note, writeup'
        appendString += '\nWHERE note.id = writeup.id AND writeup.public AND title like ?'
        appendString += '\nORDER BY title'
    }
    else appendString += `\nFROM ${table}`
    if (['ctf', 'team'].includes(table)) {
        appendString += '\nWHERE public and name like ?'
        appendString += '\nORDER BY name'
    }
    else if (table === 'user') {
        appendString += '\nWHERE username like ?'
        appendString += '\nORDER BY username'
    }


    queryString += appendString
    numRowsQuery += appendString

    const limit = (page_num - 1) * 20
    queryString += `\nLIMIT ${limit}, 21`

    db.query(
        queryString,
        search,
        (err, result) => {
            if (err) callback(err)
            else {
                const rows = <RowDataPacket[]> result
                db.query(numRowsQuery, search, (err, result) => {
                    if (err) callback(err)
                    else {
                        const numRows = (<RowDataPacket> result)[0]['COUNT(*)'] as number
                        callback(null, rows.slice(0, 20), rows.length === 21, Math.ceil(numRows / 20))
                    }
                })
            }
        })
}
