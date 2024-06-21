<?php
function support_scripts(){
    //scripts for media sharing(video/voice/screen);
	wp_enqueue_script( 'metered-source-js', 'https://cdn.metered.ca/sdk/video/1.4.6/sdk.min.js',array(),'1.0.0',array('in_footer' => true,
	'strategy'  => 'defer',));
	wp_enqueue_script( 'support-js', get_theme_file_uri( '/assets/js/support-page-v1-0-1.js' ),array(),'1.0.0',array('in_footer' => true,
	'strategy'  => 'defer',));
    wp_enqueue_style('support_page_css', get_theme_file_uri('/assets/css/support-page-v1-0-1.css'));
}
add_action('wp_enqueue_scripts', 'support_scripts');


//--------------Register endpoint to send notification.
function support_request() {
    register_rest_route('hrcode/v1', '/send-notification', array(
        'methods' => 'POST',
        'callback' => 'send_notification',
    ));
}
add_action( 'rest_api_init', 'support_request' );

function send_notification($request){
	$customer_name = $request->get_param('customerName'); 
	$customer_company = $request->get_param('customerCompany');

    if(empty($customer_name) || empty($customer_company)){
		return new WP_Error('missing_data', 'Missing request data.', array('status' => 400));
	}

    $to = array($_SERVER['HAROL_EMAIL'],$_SERVER['HAROL_PHONE'],$_SERVER['ANA_PHONE'],$_SERVER['DAVID_PHONE'],$_SERVER['FERNANDA_EMAIL']);
    $subject = 'support requested';
    $message = "TEST: $customer_name from $customer_company is waiting on the support room";
    wp_mail($to,$subject,$message);

    return rest_ensure_response('notification sent!!');
}
