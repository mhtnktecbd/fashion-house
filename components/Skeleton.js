import styles from './Skeleton.module.css';

export default function Skeleton({ width, height, borderRadius, style, className }) {
    return (
        <div
            className={`${styles.skeleton} ${className || ''}`}
            style={{
                width,
                height,
                borderRadius: borderRadius || '8px',
                ...style
            }}
        />
    );
}
