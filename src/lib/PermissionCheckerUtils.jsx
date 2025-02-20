

import React from "react";
export default function PermissionCheckerUtils({ children, action_url }) {

    // Permission Checking Logic Goes Here
    // ...
    // ... 
    // ...


    const childrenWithProps = React.Children.map(children, child => {

        if (React.isValidElement(child)) {
            return React.cloneElement(child, { action_url });
        }
        return child;
    });



    const Permission = true;
    return (
        <>
            {Permission && childrenWithProps}
        </>
    )

};