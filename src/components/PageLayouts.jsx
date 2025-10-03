
import Sidebar from './app-sidebar';

const PageLayout = ({ children }) => {
const mainContentMargin = 'w-[calc(100%-250px)]'; 
    return (
        <div className="flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 h-full z-10">
            <Sidebar isExpanded={true} onToggle={() => {}} /> 
        </div>

        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
            <div className="flex-1 overflow-auto">
            {children}
            </div>
        </div>
        </div>
    );
};

export default PageLayout;