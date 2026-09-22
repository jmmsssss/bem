import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement> & { className?: string }) {
    return (
        <img
            src="/images/solvity.png"
            alt="App Logo"
            className={`h-10 w-auto object-contain ${props.className || ''}`}
        />
    );
}
