import {BasicUser, RegisteringUser} from "../../cs6131-backend/types/userTypes";
import Vue from "vue";
import {getCookie, removeCookie} from "typescript-cookie";
import jwt_decode from "jwt-decode";
import {AlertData} from "@/schemas/alertData";

export const register = (user: RegisteringUser): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
        fetch(`${Vue.prototype.$apilink}/users/register`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user),
        }).then(response => {
            resolve(response);
        });
    });
};

export const getUser = (username: string): Promise<BasicUser> => {
    return new Promise<BasicUser>((resolve, reject) => {
        fetch(`${Vue.prototype.$apilink}/users/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        ).then(res => {
            if (res.status == 200) return res.json()
            else reject(res)
        }).then(json => {
            resolve(json.data)
        }).catch(err => reject(err))
    })
};

export const userExists = (username: string): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
        getUser(username).then(data => {
            if (Object.keys(data).length === 0) resolve(false)
            else resolve(true)
        })
    });
}

export const login = (username: string, password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        fetch(`${Vue.prototype.$apilink}/users/login`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => {
            if (res.status === 200) {
                res.json().then(data => {
                    resolve(data.token);
                })
            }
            if (res.status === 400) reject(res.statusText);
        })
    });
}

export const onLogin = (callback: Function) => {
    const token = getCookie('token');
    if (token) {
        try {
            const decoded = jwt_decode(token);
            const decodedKeys = Object.getOwnPropertyNames(decoded);
            if(Object.keys(new BasicUser()).every((key) => decodedKeys.includes(key))) {
                // eslint-disable-next-line no-unused-vars
                const {iat, exp, ...user} =decoded as any;
                callback(null, user as BasicUser);
            }
            else {
                removeCookie('token')
                callback({alertType: "error", alertTitle: "Login Error", alertText: "Please login again"} as AlertData);
            }
        }
        catch {
            removeCookie('token')
            callback({alertType: "error", alertTitle: "Login Error", alertText: "Please login again"} as AlertData);
        }
    }
    else callback(null, {} as BasicUser)
}

export const editUser = (user: BasicUser): Promise<Response> => {
    return new Promise<Response>((resolve) => {
        const token = getCookie('token') || ''
        fetch(`${Vue.prototype.$apilink}/users/edit`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({user: user})
        }).then(res => {
            resolve(res)
        })
    })
}

export const deleteAccount = (username: string): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
        const token = getCookie('token') || ''
        fetch(`${Vue.prototype.$apilink}/users/delete/${username}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            }
        }).then(res => {
            if (res.status===200) resolve(true)
            else resolve(false)
        })
    })
}