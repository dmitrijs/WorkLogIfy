import React from "react";
import App from "./App";
import StoreContentProvider from "./Store/Store";

const AppBase = () => {
    return (
        <StoreContentProvider>
            <App />
        </StoreContentProvider>
    );
};

export default AppBase;
