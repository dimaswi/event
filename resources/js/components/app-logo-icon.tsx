import { ImgHTMLAttributes } from 'react';
import Logo from '../../../public/1.png';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
}

export default function AppLogoIcon({ src, ...props }: AppLogoIconProps) {
    return (
        <img 
            {...props} 
            src={src || Logo} 
            alt="logo"
        />
    );
}
