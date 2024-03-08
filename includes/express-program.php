<?php
/*** change details page url */
function change_link( $permalink, $post ) {
    if( $post->post_type == 'shop_products' ) { // assuming the post type is video
        $permalink = home_url( 'new-landing-page?sproduct_id='.$post->ID );
    }
    return $permalink;
}
add_filter('post_type_link',"change_link",10,2);

// change text when "order now" is clicked while disabled
add_filter( 'woocommerce_get_script_data', 'change_alert_text', 10, 2 );
function change_alert_text( $params, $handle ) {
    if ( $handle === 'wc-add-to-cart-variation' )
        $params['i18n_make_a_selection_text'] = __( 'Please make sure to select every finish/style options available. testtttt', 'domain' );
    return $params;
}

remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart');

add_action( 'init', 'remove_product_price_shop_page' );
function remove_product_price_shop_page() {
    remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_price', 10 );
}

function category_link_shortcode() {
    global $post;

    $product_id = $post->ID;
    $product_categories = wp_get_post_terms( $product_id, 'product_cat' );

    if ( ! empty( $product_categories ) ) {
        $category = $product_categories[0];
        $category_link = get_term_link( $category->term_id, 'product_cat' );

        if ( ! is_wp_error( $category_link ) ) {
            return esc_url( $category_link );
        }
    }
}
add_shortcode( 'category_link', 'category_link_shortcode' );

// Change add to cart text on single product page
add_filter( 'woocommerce_product_single_add_to_cart_text', 'woocommerce_add_to_cart_button_text_single' ); 
function woocommerce_add_to_cart_button_text_single() {
    return __( 'ORDER NOW', 'woocommerce' ); 
}

// change woocommerce thumbnail image size
add_filter( 'woocommerce_get_image_size_gallery_thumbnail', 'override_woocommerce_image_size_gallery_thumbnail' );
function override_woocommerce_image_size_gallery_thumbnail( $size ) {
    // Gallery thumbnails: proportional, max width 200px
    return array(
        'width'  => 260,
        'height' => 260,
        'crop'   => 0,
    );
}

// enable ACF's options page
if( function_exists('acf_add_options_page') ) {
    acf_add_options_page();
}

add_shortcode( 'product_sku_div', 'wc_product_sku_div');
function wc_product_sku_div() {
    global $product;

    if( ! is_a('WC_Product', $product) ) {
        $product = wc_get_product( get_the_id() );
    }

    ## 1 - For variable products (and their variations)
    if( $product->is_type('variable') ) {
        ob_start(); // Starting buffering

        ?>
        <div class="widget" sp-sku=""></div>
		<input type='hidden' name='generatedSku' value=''>

        <script type="text/javascript">
//         jQuery( function($){
//             $('form.variations_form').on('show_variation', function( event, data ){
//                 $( 'div.widget' ).attr( 'sp-sku', data.sku );
// //                 For testing
//                 console.log( 'Variation Id: ' + data.variation_id + ' | Sku: ' + data.sku );
// 				 $( 'input[name="generatedSku"]' ).val(data.sku);
// 				var url = "https://identity.ezpricing.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dezpo%26redirect_uri%3Dhttps%253A%252F%252Fezpricing.fabuwood.com%252Fsignin-oidc%26response_type%3Dcode%26scope%3Dopenid%2520profile%26response_mode%3Dform_post%26nonce%3D638222145675591808.ZWVmNWQ3ZTgtOWFkNC00Yjc1LWFjMmYtYzE4ODZjNGFiZWEwYTQ1NWUzYTktYTg3MC00MWYyLThiOWEtNmNkYmRhMjA0Zjgz%26code_challenge%3DHjZKtjLxlJyUc6ZS8h6NHYfpX8gm_pxpcFZn1UGH5dg%26code_challenge_method%3DS256%26state%3DCfDJ8MR-AgKxTJlDu8MKwsN5kAtBtTjJShwM2yQQbxJkt7l5-MwQxn_59a0bpJ4nqcN8QcLYEW9N_IQWJG7DNtEpuslle6vY6GahUOrcl9jwmC0v7NFCJ-FyPHuqooGkbRlyHbuTOIy2LIY__DhoHMZ3Rr-5JVYzpwwkwCytDDIv-XhM5ko8c9Bl8IGmefj1bfFZZHGuHzw2OTJbgDge0XLKRYzzH_YmIiUcpWk_fPcfmyYDA2h7zMiOAADDjF9_V-SHBRLHmS2fAYBFbAN3fFZ6H2MPS7txjRM0jN8EhJDnDygr5F26kkB28qzpGrUNohr8UmZlGdwQd0CTL6Kb4lXcaT-Fdh5_M57zrnpIOWUcrR90HjpFrD7B3Spxi0jCMuj4W9aYn4JDXfY1Lel2cdtyK6AqFqLW4fIDJMIu8B0xRebt%26x-client-SKU%3DID_NETSTANDARD2_0%26x-client-ver%3D5.3.0.0";
//             });
//             $('form.variations_form').on('hide_variation', function(){
//                 $( 'div.widget' ).attr( 'sp-sku', '' );
//             });
//         });
        </script>


<?php

        return ob_get_clean(); // return the buffered content
    }
    ## 2 - For other products types
    else {
//         return sprintf( '<div class="widget" sp-sku="%s"></div>', $product->get_sku() );
    }
}

add_action('woocommerce_before_single_product', 'get_product_attributes');

function get_product_attributes() {
    global $product;
    
    // Check if it's a product page
    if (is_product()) {
        $attributes = $product->get_attributes();
        
        // Loop through the attributes
        foreach ($attributes as $attribute) {
            $attribute_name = $attribute['name'];
            $attribute_label = wc_attribute_label($attribute_name);
            $attribute_value = $product->get_attribute($attribute_name);
			
            // Output the attribute label and value
//             echo '<p>' . $attribute_label . ': ' . $attribute_value . '</p>';
			get_attribute_terms($attribute_name);
        }
    }
}

function get_attribute_terms($attribute_slug) {
    global $product;
    
    // Check if it's a product page
    if (is_product()) {
        $attribute_terms = $product->get_attribute($attribute_slug);
        
        if (!empty($attribute_terms)) {
            $terms = explode(', ', $attribute_terms);
            
            foreach ($terms as $term) {
                $term_object = get_term_by('slug', $term, $attribute_slug);
                
                if ($term_object) {
                    $term_label = $term_object->name;
                    $term_name = $term_object->slug;
                    $term_description = $term_object->description;
                    
                    // Output the term label, name, and description
//                     echo '<p><strong>Label:</strong> ' . $term_label . '</p>';
//                     echo '<p><strong>Name:</strong> ' . $term_name . '</p>';
//                     echo '<p><strong>Description:</strong> ' . $term_description . '</p>';
                }
            }
        }
    }
}

// Register endpoint to ask for password on 3D button
add_action( 'rest_api_init', 'ask_for_password_3d' );

function ask_for_password_3d() {
    register_rest_route('nectho/v1', '/download-3d', array(
        'methods' => 'POST',
        'callback' => 'ask_password',
    ));
}

// Handle password request
function ask_password($request) {
    $password = $request->get_param('password');
    $post_id = $request->get_param('post_id');
//     $correct_password = "123";
	$shortcode = '[jet_engine_data dynamic_field_source="options_page" dynamic_field_option="global-options::_global_pdf-password" hide_if_empty="" field_fallback="davidici123#"]';
	$correct_password = do_shortcode($shortcode);
	
	if (empty($post_id)) {
        return new WP_Error('missing_data', 'Missing request data.', array('status' => 400));
	}

    if ($password && ($password === $correct_password)) {
        $url = get_post_meta($post_id, '_wc-ep-custom-field-file-3d', true);
        
        if (!empty($url)) {
            return rest_ensure_response($url);
        } else {
            return new WP_Error('no_url_found', 'No URL found for the post.', array('status' => 404));
        }
    } else {
        return new WP_Error('password_incorrect', 'Password incorrect.', array('status' => 401));
    }
}


// link building
// // Register endpoint to fetch SKU
add_action( 'rest_api_init', 'build_product_link' );

function build_product_link() {
    register_rest_route('nectho/v1', '/get-product-link', array(
        'methods' => 'POST',
        'callback' => 'get_product_link',
    ));
}

// AUX function to check if vanity is a double (like Elora 48" is 24"+24")
function checkDoubleVanityMeta($post_id) {
    // Get the meta value of "_wc-ep-is-double-vanity" for the post
    $is_double_vanity = get_post_meta($post_id, '_wc-ep-is-double-vanity', true);

    if ($is_double_vanity === 'true') {
        $is_double_vanity = true;
    } else {
        $is_double_vanity = false;
    }

    return $is_double_vanity;
}

// AUX function 
function doubleCodeWhenDoubleVanity($code) {
	if (!$code) {
		return '';
	}
	
	$first_code_position = strpos($code, '~');
	
	if ($first_code_position !== false) {
		// Extract the first snippet from the code
		$first_snippet = substr($code, 0, $first_code_position);

		// Concatenate the first snippet with the original code
		$result = $first_snippet . '~' . $code;

		return $result;
	} else {
		return $code;
	}
}

// AUX function
function detectIfWashbowl($attribute_name) {
	if (strpos($attribute_name, 'Washbowl') !== false) {
// 		echo "The string contains the word 'Washbowl'.\n";
		return true;
	} else {
// 		echo "The string does not contain the word 'Washbowl'.\n";
		return false;
	}
}

// AUX function
function doubleWashbowlCodeWhenDoubleVanity($code) {
	if (!$code) {
		return '';
	}
	
    $snippets = explode('~', $code);
    $result = [];
    
    foreach ($snippets as $snippet) {
        $result[] = $snippet;
        
        if (strpos($snippet, '18030-R36') === 0
            || strpos($snippet, '18030-SR55') === 0
            || strpos($snippet, '18030-MR50') === 0) {
            $result[] = $snippet;
        }
    }
    
    $duplicatedCode = implode('~', $result);
    return $duplicatedCode;
}

// AUX function
function search_main_finish($attribute_name) {
	if (strpos($attribute_name, "finish") !== false) {
		// The string contains the substring 'finish'
		return true;
	} else {
		// The string does not contain the substring 'finish'
		return false;
	}
}

// AUX function
function get_vanity_size($post_id) {
	$terms = get_the_terms($post_id, "pa_vanity-sizes");	
	
	if (!empty($terms) && !is_wp_error($terms)) {
        foreach ($terms as $term) {
            return $term->name;
        }
    }
	
	return null;
}

function get_product_link($request) {
    $post_id = $request->get_param('post_id');
	$selected_values = $request->get_param('selected_values');
	
	if (empty($post_id)) {
        return new WP_Error('missing_data', 'Missing request data.', array('status' => 400));
	}
	
	// get product
	$product = wc_get_product($post_id);
    
    if ($product) {
		// get base SKU for the product
		$base_sku = $product->get_sku();
		// build the base URL adding the base sku at the end
		$base_url = "https://davidici.datamark.live/?app=Bath%20Vanities&SKU=";
		
		$vanity_size = get_vanity_size($post_id);
		
		$default_attribute_names = [];
		
		// check if vanity is a double
		$is_double_vanity = checkDoubleVanityMeta($post_id);
		// check if washbowl was detected
		$has_washbowl = false;
		
		// check if product is variable to get the default attributes (for when page has been loaded)
		if ($product->is_type('variable')){
			// if selected_values is empty, means page has been loaded. If it's not empty, means user has already selected some attribute value(s)
			if ($selected_values) {
				foreach ($selected_values as $selected_value) {
					// key($selected_value) gets the attribute's name
					$default_attribute_names[] = $selected_value[key($selected_value)];
				}
			} else {
				$default_attributes = $product->get_default_attributes();

				// add all default attribute names to an array
				foreach ($default_attributes as $default_attribute) {
					$default_attribute_names[] = $default_attribute;
				}
			}
		
			// Get the product attributes
			$attributes = $product->get_attributes();
			
			$special_char_to_identify_empty_sku = "**";
			$main_finish_detected = false;
			$main_finish_attribute_name = "";
			$main_finish_term_sku = "";

			// this counter will be used as the index for adding elements on the skus array
			$count = 0;
			foreach ($attributes as $attribute) {
				// get the attribute data (so we can get its slug (name) and description (sku))
				$att_data = $attribute->get_data();

				// Check if the attribute is visible on the product page
				if ($att_data["visible"] && $att_data["variation"]) {
					// Add the attribute name to the list of visible attributes, which will be used to know how many hiphen-separated skus there will be
					$visible_attributes[] = $att_data["name"];
					// set -** as default (for the page loads)
					$found = "-".$special_char_to_identify_empty_sku;
					
					if (!$main_finish_set) {
						$main_finish_set = search_main_finish($att_data["name"]);
					}

					// loop through each option (term) of the attribute
					foreach ($att_data["options"] as $option) {
						// get term slug (name) and description (sku)
						$term_slug = get_term( $option )->slug;
						$term_sku = get_term( $option )->description;
						
						// check if the option name contains "Washbowl" word
						if (!$has_washbowl) {
							$has_washbowl = detectIfWashbowl(get_term( $option )->name);
						}

						// check if the term slug is one of the default
						if (in_array($term_slug, $default_attribute_names)) {
							if ($main_finish_set && $main_finish_term_sku === "") {
								$main_finish_term_sku = $term_sku;
							}
							
							// if SKU starts with #, means that it should not have a "-"
							if (str_starts_with($term_sku, '#')) {
								// if so, add the term SKU to the skus array without the "-" instead of adding $special_char_to_identify_empty_sku (if term doesn't have a description, then it will be $special_char_to_identify_empty_sku nonetheless)
								$found = (strlen($term_sku) > 0) ? str_replace('#', '', $term_sku) : $special_char_to_identify_empty_sku;
								
								// this is specific for "22" - Mirror Cabinet - 1 Door" (SKU 29255), which adds "NX" to the end of the SKU for no reason whatsoever (?)
								if ($base_sku == "29255") {
									$found = $found . "NX";
								}
								
								// this is specific for "32" - Mirror Cabinet - 2 Door" (SKU 28281 and 29380), because their SKU varies even though they are the same products
// 								if ($base_sku == "2") {
// 									if ($found == "BF" || $found == "BI" || $found == "BF" || $found == "BF" || $found == "BF")
// 									$found = $found;
// 								}
								
								// this is specific for "Maremana" Shower Base (SKU JND-LTP813), because its SKU is out of pattern
								if ($base_sku == "JND-LTP813" && (($term_sku == "6032") || ($term_sku == "#6032"))) {
									$found = "";
								}
								
								break;
							} if (str_starts_with($term_sku, '~')) {
								$found = (strlen($term_sku) > 0) ? "".$term_sku : $special_char_to_identify_empty_sku;
								break;
							} else {
								// if so, add the term SKU to the skus array instead of adding "-$special_char_to_identify_empty_sku" (if term doesn't have a description, then it will be -$special_char_to_identify_empty_sku nonetheless)
								$found = (strlen($term_sku) > 0) ? "-".$term_sku : "-".$special_char_to_identify_empty_sku;
								break;
							}
						}
					}

					// add the found sku on the skus array
					$skus[$count] = $found; 
					$count++;
				}
			}
		}
		
		$pre_sku_buildup = $base_sku . '';
		
		if (isset($skus) && isset($visible_attributes) && sizeof($visible_attributes) > 0 && sizeof($skus) > 0) {
			for ($i = 0; $i < sizeof($visible_attributes); $i++) {
				// visible attributes and skus arrays both have the same size, and index 0 on the first is the key while the index 0 on the second is the value
				if ($skus[$i] != '-@') {
					$pre_sku_buildup = $pre_sku_buildup . $skus[$i];
				}
			}
		}
		
		if ($is_double_vanity) {
			$pre_sku_buildup = doubleCodeWhenDoubleVanity($pre_sku_buildup);
		}
		
		if ($has_washbowl) {
			if ($is_double_vanity) {
				$pre_sku_buildup = doubleWashbowlCodeWhenDoubleVanity($pre_sku_buildup);
			}
			
			if ($main_finish_set && $main_finish_term_sku) {
				switch ($vanity_size) {
					case "24":
						$top_sku = "~14-TP1-060-".substr($main_finish_term_sku, 0, 3);
						break;
						
					case "48":
						if ($base_sku != "68-BP-082") {
							$top_sku = "~14-TP1-060-".substr($main_finish_term_sku, 0, 3);
						}
						break;
						
					default:
						$top_sku = "";
						break;
				}
				
				$pre_sku_buildup = $pre_sku_buildup . $top_sku;
			}
		}
		
		$pre_sku_buildup = str_replace("MBI-MBI", "MBI", $pre_sku_buildup);
		
		// build the url using the skus array
		$url = $base_url . $pre_sku_buildup;
		
		return $url;
    } else {
		return new WP_Error('invalid_product', 'Invalid product.', array('status' => 400));
	}
}



// Register endpoint to fetch SKU of an attribute term. This will be used, for instance, to get the main color that was selected
add_action( 'rest_api_init', 'register_sku_desc_endpoint' );

function register_sku_desc_endpoint() {
    register_rest_route('nectho/v1', '/get-sku-desc', array(
        'methods' => 'POST',
        'callback' => 'get_term_description',
    ));
}

// Handle custom endpoint request
function get_term_description($request) {
    $attribute = $request->get_param('attribute');
    $term = $request->get_param('term');

    $term_obj = get_term_by('slug', $term, $attribute);

    if ($term_obj && !is_wp_error($term_obj)) {
        $description = $term_obj->description;
        return rest_ensure_response($description);
    } else {
        return new WP_Error('term_not_found', 'Term not found.', array('status' => 404));
    }
}

/* Increase Woocommerce Variation Threshold */
 function wc_ajax_variation_threshold_modify( $threshold, $product ){
  $threshold = '1111';
  return  $threshold;
 }
add_filter( 'woocommerce_ajax_variation_threshold','wc_ajax_variation_threshold_modify', 10, 2 );

