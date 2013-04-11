function tab_initialize_motor_output() {
    for (var i = 0; i < motors; i++) {
        $('div.tab-motor_output .titles li:eq(' + i + ')').addClass('active');
    }
    
    // request motor out data from flight controller
    timers.push(setInterval(motor_pull, 50));
}

function motor_pull() {
    var bufferOut = new ArrayBuffer(7);
    var bufView = new Uint8Array(bufferOut);

    // sync char 1, sync char 2, command, payload length MSB, payload length LSB, payload
    bufView[0] = PSP.PSP_SYNC1; // sync char 1
    bufView[1] = PSP.PSP_SYNC2; // sync char 2
    bufView[2] = PSP.PSP_REQ_MOTORS_OUTPUT; // command
    bufView[3] = 0x00; // payload length MSB
    bufView[4] = 0x01; // payload length LSB
    bufView[5] = 0x01; // payload
    bufView[6] = bufView[2] ^ bufView[3] ^ bufView[4] ^ bufView[5]; // crc
    
    chrome.serial.write(connectionId, bufferOut, function(writeInfo) {
        // console.log("Wrote: " + writeInfo.bytesWritten + " bytes");
    }); 
}

function process_motor_output() {
    var view = new DataView(message_buffer, 0); // DataView (allowing is to view arrayBuffer as struct/union)
    
    var data = new Array(); // array used to hold/store read values

    var needle = 0;
    for (var i = 0; i < (message_buffer_uint8_view.length / 2); i++) {
        data[i] = view.getInt16(needle, 0);
        needle += 2;
    }
    
    // Render data
    for (var i = 0; i < data.length; i++) {
        data[i] -= 1000; 
        var margin_top = 330.0 - (data[i] * 0.33);
        var height = (data[i] * 0.33);
        var color = parseInt(data[i] * 0.256);
        $('.motor-' + i + ' .indicator').css({'margin-top' : margin_top + 'px', 'height' : height + 'px', 'background-color' : 'rgb(' + color + ',0,0)'});
    }
    
}