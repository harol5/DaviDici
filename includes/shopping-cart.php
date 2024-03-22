<?php
function my_files(){
	if( is_archive() ){
		wp_enqueue_script( 'shopping_cart_js', get_theme_file_uri( '/assets/js/price-list/shopping-cart-v-1-0-1.js' ),array(),'1.0.0',array('in_footer' => true,
		'strategy'  => 'defer',));
		wp_enqueue_style('shopping_cart_css', get_theme_file_uri('/assets/css/shopping-cart.css'));
	}
}
add_action('wp_enqueue_scripts', 'my_files');


//--------------Register endpoint to get product info.
add_action( 'rest_api_init', 'product_info' );
function product_info() {
    register_rest_route('hrcode/v1', '/product-info', array(
        'methods' => 'POST',
        'callback' => 'get_product_info',
    ));
}
function get_product_info($request){
	$post_id = $request->get_param('post_id');
	$quantity = $request->get_param('quantity');

	if(empty($post_id)){
		return new WP_Error('missing_data', 'Missing request data.', array('status' => 400));
	}

	$product = wc_get_product($post_id);
	if($product){

        $product_price = $product-> get_attribute( 'msrp' );
		$product_size = $product-> get_attribute( 'size' );
        $crr_total =  $product_price * $quantity;
		$sink_position = $product-> get_attribute( 'sink-position' );
		$stock_status = $product-> get_attribute( 'stock-status' );

		$product_categories_ids = $product->get_category_ids();
		$categories = array();
		foreach($product_categories_ids as $id){
			if( $term = get_term_by( 'id', $id, 'product_cat' ) ){
				array_push($categories, $term->name);
			}
		}
		
		$product_info_list = array(
			"id" => $post_id,
			"name" => $product->get_name(),
			"sku" => $product->get_sku(),
			"size" => $product_size,
			"categories" => $categories,
			"sinkPosition" => $sink_position,
			"qty" => $quantity,
            "unitPrice" => $product_price,
            "total" => $crr_total,
			"isOnShoppingCart" => true,
			"stockStatus" => $stock_status,
		);

		return rest_ensure_response($product_info_list);

	}else {
		return new WP_Error('invalid_product', 'Invalid product.', array('status' => 400));
	}
}
