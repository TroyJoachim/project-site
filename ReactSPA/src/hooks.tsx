import { useRef } from "react";

// This hook is used to scroll to a build step on the project page.
export const useScroll = (): [() => void, React.MutableRefObject<null>] => {
  const elRef = useRef(null);
  const executeScroll = () => {
    const er: any = elRef.current;
    if (er) er.scrollIntoView();
  };

  return [executeScroll, elRef];
};
