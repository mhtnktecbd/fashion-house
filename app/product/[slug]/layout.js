export default function ProductLayout({ children }) {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <main className="min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
