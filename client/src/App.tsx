import {COMMODITIES} from "@constants/commodities.ts";
import {CommodityBar} from "@components/CommodityBar.tsx";
import {NewsSection} from "@components/NewsSection.tsx";

function App() {
    return (
        <>
            <div className="flex w-full max-h-screen h-screen">
                {/* Commodity Bar Section */}
                <div className="items-center m-4 space-y-2 w-2/3 overflow-y-auto">
                    {COMMODITIES.map((commodity) => (
                        <CommodityBar key={commodity} commodity={commodity}/>
                    ))}
                </div>
                <NewsSection />
            </div>
        </>
    )
}

export default App;
