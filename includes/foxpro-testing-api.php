<?php
function test_api() {
    register_rest_route('hrcode/v1', '/test-api', array(
        'methods' => 'POST',
        'callback' => 'call_foxpro_api',
    ));
}
add_action( 'rest_api_init', 'test_api' );

function vfp_exec($data){

    // Config
    $request_origin = 'https://www.sdifurniture.com'; // Or use: $_SERVER['HTTP_ORIGIN'];
    $api_url = 'https://sdi.datamark.live/API/Main.asp';
    $api_user = $_SERVER['FOXPRO_USER'];
    $api_secret = $_SERVER['FOXPRO_API_KEY']; // Important: Don't expose this password to the front-end

   if(isset($_COOKIE['php_asp_session_link'])){
       $id = $_COOKIE['php_asp_session_link'];
       if(isset($_COOKIE[$id])){
           $header_session = 'Cookie: ' . $id . '=' . $_COOKIE[$id] . '\r\n';
       }
   } else {
       $header_session = '';
   }

   $js_data = json_encode($data);
   $opts = [
       "http" => [
           "method" => "GET",
           "header" => [
               "Origin: " . $request_origin . "\r\n" .
               "Authorization: Basic " . base64_encode($api_user . ":" . $api_secret) . "\r\n" .
               "Content-Type: application/json\r\n" .
               "Content-Length: " . strlen($js_data) . "\r\n" .
               $header_session
           ],
           "content" => $js_data
       ]
   ];

   $context = stream_context_create($opts);
   $result = file_get_contents($api_url, false, $context);
   $cookies = array();
   foreach($http_response_header as $s){
       if(preg_match('|^Set-Cookie:\s*([^=]+)=([^;]+);(.+)$|', $s, $parts)){
           $cookies[$parts[1]] = $parts[2];
           if(strpos($parts[1], 'ASPSESSIONID') === 0){
               setcookie('php_asp_session_link', $parts[1], time() + (86400 * 30), "/");
               setcookie($parts[1], $parts[2], time() + (86400 * 30), "/");
           }
       }
   }
//    return json_decode($result);
   return $result;
}


function call_foxpro_api($request){
	$func_name = $request->get_param('funcInput');
	$params = $request->get_param('paramInput');

	if(empty($func_name)){
		return new WP_Error('missing_data', 'Missing request data.', array('status' => 400));
	}

    $data = vfp_exec([
        'action' => $func_name,
        'params' => $params,
        'keep_session' => false
    ]);

    return rest_ensure_response($data);
}
