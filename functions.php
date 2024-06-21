<?php
function enqueue_parent_styles() {
	wp_enqueue_style( 'parent-style', get_template_directory_uri().'/style.css' );

	if( is_archive() ){
		wp_enqueue_style('price_list_css', get_theme_file_uri('/assets/css/price-list.css'));
		wp_enqueue_script( 'price_list_main_js', get_theme_file_uri( '/assets/js/price-list/main-v1-0-4.js' ),array(),'1.0.0',array('in_footer' => true,
		'strategy'  => 'defer',));
	}

	wp_enqueue_style('password_protected_css', get_theme_file_uri('/assets/css/password-protected.css'));
	wp_enqueue_script( 'password_protected_js', get_theme_file_uri( '/assets/js/password-protected.js' ),array(),'1.0.0',array('in_footer' => true,
	'strategy'  => 'defer',));
	
	wp_enqueue_style('menu_collection_toggle_button_css', get_theme_file_uri('/assets/css/menu-collection-toggle-button.css'));
	wp_enqueue_script( 'menu_collection_toggle_button_js', get_theme_file_uri( '/assets/js/menu-collection-toggle-button.js' ),array(),'1.0.0',array('in_footer' => true,
	'strategy'  => 'defer',));

	wp_enqueue_style('specs_css', get_theme_file_uri('/assets/css/specs.css'));
	wp_enqueue_style('price_list_gallery_css', get_theme_file_uri('/assets/css/price-list-gallery.css'));
	wp_enqueue_style('modal_css', get_theme_file_uri('/assets/css/modal.css'));
}
add_action( 'wp_enqueue_scripts', 'enqueue_parent_styles' );


function add_type_attribute($tag, $handle, $src) {
    // if not your script, do nothing and return original $tag
    if ( 'price_list_main_js' !== $handle ) {
        return $tag;
    }
    // change the script tag by adding type="module" and return it.
    $tag = '<script type="module" src="' . esc_url( $src ) . '"></script>';
    return $tag;
}
add_filter('script_loader_tag', 'add_type_attribute' , 10, 3);

/*======================== HRCODE DEVEPLOMENT =============================*/
include(get_theme_file_path( "/includes/express-program.php" ));
include(get_theme_file_path( "/includes/shopping-cart.php" ));
include(get_theme_file_path( "/includes/track-order.php" ));
include(get_theme_file_path( "/includes/support-page.php" ));
include(get_theme_file_path( "/includes/foxpro-testing-api.php" ));
include(get_theme_file_path( "/includes/logger.php" ));

// global $wp;
// write_log( add_query_arg( $wp->query_vars, home_url( $wp->request ) ) );
// write_log( add_query_arg( $wp->query_vars, home_url( $wp->request ) ) );

// $uploads  = wp_upload_dir( null, false );
// $logs_dir = $uploads['basedir'] . '/davidici-custom-logs';

// if ( ! is_dir( $logs_dir ) ) {
//     mkdir( $logs_dir, 0755, true );
// }

// $file = fopen( $logs_dir . '/' . 'log.log', 'w' );




