export default function Footer() {
    return (
        <footer style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', fontSize: '14px', color: '#6b7280', marginTop: 'auto' }}>
            <div className="container">
                &copy; {new Date().getFullYear()} AuthenticBazar. All rights reserved.
            </div>
        </footer>
    );
}
