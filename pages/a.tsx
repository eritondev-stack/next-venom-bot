import { useEffect } from "react"



export default function A() {

    useEffect(() => {
        console.log('É nada')
    })
    return <div className="text-blue-500">a</div>
}
