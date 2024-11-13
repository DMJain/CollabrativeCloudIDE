import {
    FaFile,
    FaJava,
} from 'react-icons/fa';
import {
    SiJavascript,
    SiTypescript,
    SiCss3,
    SiHtml5,
    SiReact,
    SiJson,
    SiMarkdown,
    SiNodedotjs,
    SiPython,
    SiPhp,
    SiCsharp,
} from 'react-icons/si';
import {
    BsFilePdf,
    BsFileImage,
    BsFileBinary,
} from 'react-icons/bs';

export const fileIcons = {
  js: <SiJavascript color="#f7df1e" />,
  ts: <SiTypescript color="#007acc" />,
  css: <SiCss3 color="#264de4" />,
  html: <SiHtml5 color="#e34c26" />,
  jsx: <SiReact color="#61dafb" />,
  json: <SiJson color="#cbcbcb" />,
  md: <SiMarkdown color="#083fa1" />,
  node: <SiNodedotjs color="#68a063" />,
  py: <SiPython color="#306998" />,
  php: <SiPhp color="#4f5b93" />,
  java: <FaJava color="#b07219" />,
  cs: <SiCsharp color="#178600" />,
  pdf: <BsFilePdf color="#e34f26" />,
  png: <BsFileImage color="#5e5e5e" />,
  jpg: <BsFileImage color="#5e5e5e" />,
  jpeg: <BsFileImage color="#5e5e5e" />,
  gif: <BsFileImage color="#5e5e5e" />,
  bmp: <BsFileImage color="#5e5e5e" />,
  bin: <BsFileBinary color="#5e5e5e" />,
  default: <FaFile color="#5e5e5e" />, // Default file icon
};