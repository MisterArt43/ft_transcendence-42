'use client'

import {useContext, useEffect, useState} from 'react'
import InputPod from '@/components/(ben_proto)/login/InputPod'
import * as POD from "@/shared/types";
import {IUser} from "@/shared/types";
import * as apiReq from '@/components/api/ApiReq'
import {authManager} from '@/components/api/ApiReq'
import * as ClipLoader from 'react-spinners'
import './auth.css'
import {useRouter} from 'next/navigation';
import {LoggedContext, SocketContextChat, SocketContextGame, UserContext} from '@/context/globalContext';

// import { Button } from '@/components/CustomButtonComponent'
enum EStepLogin {
    init,
    start,
    tryLoginAsInvite,
    signOrLogIn,
    signIn,
    logIn,
    enterLogin,
    enterPassword,
    tryToCreateAccount,
    tryToConnect,
    loading,
    successLogin,
    failLogin,
    errorLogin,
    bye
}

export async function getUserMe() {
    try {
        return await apiReq.getApi.getMePromise()
            .then((req) => {
                console.log("[Get User Me]", req.data.login);
                return req.data as IUser;
            });

    } catch (error) {
        console.error("[Get User Me ERROR]", error);
    }
}


export async function getUserFromLogin(login: string) {
    try {
        return await apiReq.getApi.getUserByLoginPromise(login)
            .then((req) => {
                console.log("[Get User From Login]", req.data.login);
                return req.data as IUser;
            });

    } catch (error) {
        console.error("[Get User From Login ERROR]", error);
    }
}

export default function Auth({className}: { className?: string }) {


    const {userContext, setUserContext} = useContext(UserContext);
    const {setLogged} = useContext(LoggedContext);
    // const [isLogged, setIsLogged] = useState<boolean | null>(null);
    const socketChat = useContext(SocketContextChat);
    const socketGame = useContext(SocketContextGame);
    const [isSignInMode, setIsSignInMode] = useState(false);


    useEffect(() => {
        console.log('UseEffect : userContext.login = ' + userContext?.login + ' pass: ' + userContext?.password);
    }, [userContext]);

    const [currentStepLogin, setCurrentStepLogin] = useState<EStepLogin>(EStepLogin.start);


    ////////////////////////////////////////////////////////
    ////////////////// GESTION DES INPUTS //////////////////
    ////////////////////////////////////////////////////////

    const [loginInput, setLoginInput] = useState<string>("");
    const [login, setLogin] = useState<string>("");

    const [passwordInput, setPasswordInput] = useState<string>('');
    const [password, setPassword] = useState<string>('');


    // Créer une instance Axios avec des en-têtes d'authentification par défaut

    ////////////////////////////////////////////////////////
    //////////////// INPUT SWITCH DISPLAY //////////////////
    ////////////////////////////////////////////////////////

    const askForLogOrSignIn = () => {
        return (
            <div>
                <button type="button" onClick={() => {
                    setCurrentStepLogin(EStepLogin.signIn)
                }} className={"button-login my-8"}>
                    <span className="text">SIGN IN</span></button>
                <button type="button" onClick={() => {
                    setCurrentStepLogin(EStepLogin.logIn)
                }} className={"button-login"}>
                    <span className="text">LOG IN</span></button>
            </div>
        )
    }

    const enterLogin = () => {
        return (
            <div className='flex flex-col justify-center items-center text-white my-2'>
                <InputPod
                    className='inputLogin'
                    props=
                        {
                            {
                                type: "text",
                                value: loginInput,
                                onChange: () => (e: React.ChangeEvent<HTMLInputElement>) => {
                                    setLoginInput(e.target.value)
                                },
                                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        () => nextStepCheck()
                                    }
                                }

                            }
                        }/>
                <div className=' font-thin'>Enter login</div>
                {}
                {enterPassword()}
            </div>
        )
    }

    const enterPassword = () => {

        return (
            <div className='flex flex-col justify-center items-center text-white my-8'>
                <InputPod
                    className='inputLogin'
                    props=
                        {
                            {
                                type: "password",
                                value: passwordInput,
                                onChange: () => (e: React.ChangeEvent<HTMLInputElement>) => {
                                    setPasswordInput(e.target.value)
                                },
                                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        setCurrentStepLogin(currentStepLogin);
                                    }
                                }
                            }
                        }
                />
                {currentStepLogin === EStepLogin.logIn ?
                    <div className=' font-thin'>Enter your password</div> :
                    <div className=' font-thin'>Create password</div>
                }
                <button type="button" className={"button-login my-12 "} onClick={() => {
                    setCurrentStepLogin(currentStepLogin === EStepLogin.logIn ?
                        EStepLogin.tryToConnect : EStepLogin.tryToCreateAccount)
                    setCredentials();
                }}><span className="text">CONNECT</span></button>

                <button type="button" className={"button-login"} onClick={() => {
                    setLogin('');
                    setLoginInput('');
                    setPassword('');
                    setPasswordInput('');
                    setCurrentStepLogin(EStepLogin.signOrLogIn);
                }}><span className="text">CANCEL</span></button>

            </div>
        )
    }

    function setCredentials() {
        if (loginInput.trim().length === 0) {
            alert('Login is empty');
            setPassword('');
            setPasswordInput('');
            setCurrentStepLogin(EStepLogin.enterLogin);
            return;
        }
        const loginTrimmed = loginInput.trim().toString();

        setLogin(loginTrimmed);

        if (passwordInput === '') {
            alert("Password is empty");
            setLogin('');
            setLoginInput('');
            setCurrentStepLogin(EStepLogin.enterLogin);
            return;
        }
        setPassword(passwordInput);
    }

    const welcomeTitle = () => {
        return (
            <>
                <div className="welcome space-y-10 my-12">
                    <div className="welcome-msg">WELCOME TO</div>
                    {/*<div className="width: 788px; height: 130px; left: 0px; top: 24px; position: absolute; justify-content: center; align-items: center; display: inline-flex">*/}
                    <div className="welcome-title ">PONG POD!</div>
                </div>
            </>
        )
    }


    const [showMessage, setShowMessage] = useState(true);
    const [showMessageFail, setShowMessageFail] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (currentStepLogin !== EStepLogin.successLogin) {
            return;
        }
        const timer = setTimeout(() => {
            setShowMessage(false);
            setCurrentStepLogin(EStepLogin.bye)
            router.push('/'); //executer apres le timeout
        }, 650); // 3000 ms = 3 secondes
        return () => clearTimeout(timer);
    }, [currentStepLogin, router]);

    const LoggedSuccess = () => {
        /*
            socketChat?.connect();
            socketGame?.connect();
            */
        return (
            <div className="flex flex-col items-center text-center">
                {showMessage && (
                    <>
                        <p className=' text-white'>Congratulations, you are now logged in!<br/>Enjoy playing!</p>
                        <ClipLoader.PacmanLoader color='#07C3FF' size={30}/>
                    </>
                )}
            </div>
        );
    }

    function backToHome() {
        setLogin('');
        setLoginInput('');
        setPassword('');
        setPasswordInput('');
        setCurrentStepLogin(EStepLogin.start);
    }

    enum authErrorState{
        emptyLogin,
        emptyPassword,
        loginNotFound ,
        badPassword = 401,
        loginAlreadyTaken = 409
    }
    const LoggedFailed = (errorCode) => {
        let errMsg: string;
        console.log("error code: " + errorCode);

        switch (errorCode) {
            case authErrorState.emptyLogin: errMsg = "The login is empty"; break;
            case authErrorState.emptyPassword: errMsg = "The password is empty"; break;
            case authErrorState.loginNotFound: errMsg = "This login doesn't exist"; break;
            case authErrorState.badPassword: errMsg = "The login and the password don't match"; break;
            case authErrorState.loginAlreadyTaken: errMsg = "This login is already taken"; break;
            default: errMsg = "Something wrong happened";
        }
        alert(errMsg);
        backToHome();
        return (
            <>{showMessageFail &&
                <div className="flex flex-col items-center text-center text-red-600">
                    <p>Error:</p>
                    <p>Wrong, the login and password do not match.</p>
                    <ClipLoader.PacmanLoader color='#07C3FF' size={30}/>
                </div>}
            </>
        );
    }


    useEffect(() => {
        if (login.length > 0) {
            console.log(`login = ${login}`);
        }
        if (password.length > 0) {
            let nb: number = password.length
            let ret: string = '';
            for (let i = 0; i < nb; i++)
                ret += '❓️';
            console.log(`password = ${ret}`);
        }
    }, [password, login]);

    const textInviteModeButton: string = 'INVITE MODE'
    const [inviteButtonText, setInviteButtonText] = useState<string>(textInviteModeButton);


    useEffect(() => {
        const fetchData = async () => {
            switch (currentStepLogin) {
                case EStepLogin.start:
                    break;

                case EStepLogin.signOrLogIn:
                    console.log("Asked for sign in or Log in");
                    break;


                case EStepLogin.enterLogin:
                    console.log('enterLogin');
                    return;

                case EStepLogin.enterPassword:
                    if (loginInput.trim().length === 0) {
                        console.log('Login is empty');
                        return;
                    }
                    const loginTrimmed = loginInput.trim().toString();
                    setLogin(loginTrimmed);
                    if (passwordInput === '') {
                        console.log('No pass, return');
                        return;
                    }
                    setPassword(passwordInput);
                    break;
                case EStepLogin.tryToConnect:
                    const existingUser: Partial<POD.IUser> = {login: login, password: passwordInput, visit: true}
                    await apiReq.postApi.postTryLogin(existingUser)
                        .then(async (res) => {
                            if (res.status === 200) {
                                const userToken = res.data;
                                localStorage.removeItem('token');
                                localStorage.setItem('token', userToken);
                                authManager.setToken(userToken);

                                setUserContext(await getUserMe());
                                setLogged(true);
                                setCurrentStepLogin(EStepLogin.successLogin);
                                localStorage.setItem('login', login);
                                localStorage.setItem('userContext', JSON.stringify(userContext));
                                console.log('you are now logged in')
                            }
                        })
                        .catch((e) => {
                            console.log("[TRY LOGIN ERROR]" + e);
                            LoggedFailed(e.response.status);
                            return;
                        })
                    return;

                case EStepLogin.tryToCreateAccount:
                    console.log(`at case: TryToCreateAccount: login: ${login}, password: ${password}`)
                    const createUser: Partial<POD.IUser> = {login: login, password: password, visit: true}
                    await apiReq.postApi.postUser(createUser)
                        .then(async (res) => {
                            if (res.status === 200) {
                                const userToken = res.data;
                                console.log(`Token: ${res.data}`);
                                localStorage.removeItem('token');
                                localStorage.setItem('token', userToken);
                                authManager.setToken(userToken);
                                localStorage.setItem("login", login);
                                const futureUser = await getUserMe();
                                setUserContext(futureUser);
                                setLogged(true);
                                setCurrentStepLogin(EStepLogin.successLogin);
                            }
                        })
                        .catch((e) => {
                            console.error("Post User ERROR: " + e, `createUser= ${createUser.login}, ${createUser.visit}`);
                            LoggedFailed(e.response.status);
                        });
                    return;
            }
        }
        fetchData();
        console.log('currentStep= ' + currentStepLogin)
    }, [currentStepLogin])


    function nextStepCheck() {
        switch (currentStepLogin) {
            case EStepLogin.start:
                setCurrentStepLogin(EStepLogin.signOrLogIn);
                break;
            case EStepLogin.enterLogin:

                if (loginInput.trim().length === 0) {
                    console.log('Login is empty');
                    return;
                } else {
                    setCurrentStepLogin(EStepLogin.enterPassword)
                }
                break;
            case EStepLogin.enterPassword:
                console.log("Enter Password: ", passwordInput);
                if (passwordInput.length === 0) {
                    console.log('PassWord is empty');
                    return;
                } else {
                    setPassword(passwordInput);
                    setCurrentStepLogin(isSignInMode ? EStepLogin.tryToCreateAccount : EStepLogin.tryToConnect)
                }
                break;

            case EStepLogin.signIn:
                setIsSignInMode(true);
                setCurrentStepLogin(EStepLogin.enterLogin);
                break;

            case EStepLogin.logIn:
                setIsSignInMode(false);
                setCurrentStepLogin(EStepLogin.enterLogin);
                break;

            case EStepLogin.tryLoginAsInvite:
        }
    }

    let defaultClassName: string;
    if (!className || className.trim().length === 0) {
        defaultClassName = 'flex flex-col items-center p-5 font-semibold text-xl space-y-10 pt-[25vh]';
    } else
        defaultClassName = className;


    return (
        <div className={defaultClassName}>
            {welcomeTitle()}
            {currentStepLogin === EStepLogin.start &&
                <button onClick={() => console.log('Not implemented')} className='button-login h-14 opacity-30'>LOGIN
                    42</button>}
            {currentStepLogin < EStepLogin.tryLoginAsInvite &&
                <button onClick={() => nextStepCheck()} className='button-login'><span>{inviteButtonText}</span>
                </button>}
            {currentStepLogin === EStepLogin.signOrLogIn && askForLogOrSignIn()}
            {currentStepLogin === EStepLogin.enterLogin && enterLogin()}
            {(currentStepLogin === EStepLogin.signIn || currentStepLogin === EStepLogin.logIn) && enterLogin()}

            {currentStepLogin === EStepLogin.signOrLogIn &&
                <ClipLoader.BeatLoader className='pt-[12vh]' color="#36d7b7" size={13}/>
            }
            {currentStepLogin === EStepLogin.successLogin && LoggedSuccess()}
            {currentStepLogin === EStepLogin.failLogin && LoggedFailed(42)}

        </div>

    )
}
