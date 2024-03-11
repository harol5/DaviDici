<?php
//------------------------------------------------------
function track_order_scripts(){
    wp_enqueue_script( 'track-order-js', get_theme_file_uri( '/assets/js/track-order-v1-0-1.js' ),array(),'1.0.0',array('in_footer' => true,
	'strategy'  => 'defer',));
    wp_enqueue_style('track_order_css', get_theme_file_uri('/assets/css/track-order-v1-0-1.css'));
}
add_action('wp_enqueue_scripts', 'track_order_scripts');


//--------------Register endpoint to get order status.
function check_order() {
    register_rest_route('hrcode/v1', '/check-order', array(
        'methods' => 'POST',
        'callback' => 'get_order_status',
    ));
}
add_action( 'rest_api_init', 'check_order' );

function get_order_status($request){
	$order_number = $request->get_param('orderNumber');

	if(empty($order_number)){
		return new WP_Error('missing_data', 'Missing request data.', array('status' => 400));
	}

    $args = array(
        'headers' => array(
            'X-API-KEY' => $_SERVER['TRACK_POD_API_KEY']
        )
    );

    $response = wp_remote_get( "https://api.track-pod.com/Order/Number/$order_number", $args );
    $body = wp_remote_retrieve_body( $response );

    return rest_ensure_response($body);
}
