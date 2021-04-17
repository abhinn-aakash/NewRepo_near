import React from 'react'
import TextField from '@material-ui/core/TextField';
import { createStream } from "../utils";
export default function Streamform() {
    return (
        <div className="uk-text-center">
            <div className="topblock">

            </div>
            <div className="formContainer uk-card uk-card-default uk-card-body">
                <form autoComplete="off">
                    
                    <p className="formlabel uk-width-1-1">ENTER TOTAL AMOUNT YOU WANT TO STREAM</p>

                    <div className="colInputs">
                        <TextField id="outlined-basic" variant="outlined" />
                        <h4 className="formlabel pertxt">Per</h4>
                        <TextField id="outlined-basic" label="Interval" variant="outlined" />


                    </div>
                    <div className="colInputs">
                      
                        <div>
                            <p className="formlabel">RECIPIENT ADDRESS</p>
                            <TextField id="outlined-basic" variant="outlined" />
                        </div>
                        <div>
                            <p className="formlabel">START DATE</p>
                            <TextField type="date" id="outlined-basic" variant="outlined" />
                        </div>
                    </div>
                   <button className="xeggoBtn" onClick={createStream}>Stream Money</button>
                </form>
            </div>
        </div>
    )
}
