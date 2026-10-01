import './style.css';
import {startGame} from './app/app';
import {strings} from './content/strings.en';
const canvas=document.querySelector<HTMLCanvasElement>('#game')!;
const root=document.querySelector<HTMLElement>('#ui')!;
startGame(canvas,root).catch(error=>{console.error(error);root.textContent=strings.bootError;});
