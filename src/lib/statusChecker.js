export function StatusCheck(status) {

    let text = ""
  //  job.status == "Pending" ? 'processing' : job.status == "In Progress" ? 'warning' : 'success'
    switch (status) {
        case "New Request":
            text = "warning"
                break;
        case "In Progress":
            text = "processing"
                break;
        case "Repaired":
            text = "success"
                break;
        case "Scrap":
            text = "error"
                break;
        default:
            text = "default"
            break;
    }
    return text;

}
export function EquipmentStatusCheck(status) {

    let text = ""
    const statusData = status === 'break_down' ? 'Break Down': status === 'complete' ? 'Complete': status === 'pending' ? 'Pending': 'In Progress'
    switch (statusData) {
        case "Pending":
            text = "processing"
                break;
        case "Complete":
            text = "success"
                break;
        case "Break Down":
            text = "error"
                break;
        default:
            text = "default"
            break;
    }
    return text;

}

export function EquipStatusCheck(status) {

    let text = ""
  //  job.status == "Pending" ? 'processing' : job.status == "In Progress" ? 'warning' : 'success'
    switch (status) {
        case "New Request":
            text = "warning"
                break;
        case "In Progress":
            text = "processing"
                break;
        case "Repaired":
            text = "success"
                break;
        case "Scrap":
            text = "error"
                break;
        default:
            text = "default"
            break;
    }
    return text;

}

export function EquipmentStatusTextCheck(status) {
        //`${job.status == "Pending" ? 'text-blue-500' : job.status == "In Progress" ? 'text-yellow-500' : 'text-green-500'}`}

    let text = ""
    const statusData = status === 'break_down' ? 'Break Down': status === 'complete' ? 'Complete': status === 'pending' ? 'Pending': 'In Progress'

    switch (statusData) {
        case "Pending":
            text = "text-blue-500"
            break;
        case "Complete":
            text = "text-green-500"
            break;
        case "Break Down":
            text = "text-red-500"
            break;
        default:
            text = "text-gray-500"
            break;
    }
    return text;

}
export function StatusTextCheck(status) {
    let text = ""
    switch (status) {
        case "New Request":
            text = "text-yellow-500"
            break;
        case "In Progress":
            text = "text-blue-500"
            break;
        case "Repaired":
            text = "text-green-500"
            break;
        case "Scrap":
            text = "text-red-500"
            break;
        default:
            text = "text-gray-500"
            break;
    }
    return text;

}
export function EquipStatusTextCheck(status) {

    let text = ""
    switch (status) {
        case "New Request":
            text = "text-yellow-500"
            break;
        case "In Progress":
            text = "text-blue-500"
            break;
        case "Repaired":
            text = "text-green-500"
            break;
        case "Scrap":
            text = "text-red-500"
            break;
        default:
            text = "text-gray-500"
            break;
    }
    return text;

}


