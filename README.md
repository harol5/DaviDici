# davidici-wordpress-custom-development

## Price List
Displays products depending on which collection the user choose.

Each collection has different type of items (vanities, wall units, side units, etc).
this items are divided into multiple listings and each listing will have products.

User is able to filter each listing and only the listings that currently have a filter
apply will be display.

### **Components**
- Filters
- Listings
- Shopping cart

### **Development**
**Filters**
for efficiency, I used JetSmartFilters Plugin and the Javascript file found on the child theme
only adds a loading spinner when the filter is fetching data from the server.

To accomplish this, JetSmartFilters provide some events when filters start loading and
finish loading, then, I use DOM manipulation to create a loading spinner container, place 
in front of the filter while is fetching, then remove it when is done fetching.

**Listings**
I used the listing widget from JetEngine Plugin because works pretty well with the filters
provided by the same plugin and the javascript file found on the child theme makes sure that only
listings that currently have one or more filters apply are being display for a better user experience.

To accomplish this, I used the same events that JetSmartFilters provide and to determine which 
listings need to be hiden or display, I used a queue, an array and an object to keep track of all
the changes that happen when user is interacting with the filters.

**Shopping Cart (In Developement)**
Im currently using a complete custom approach to develop this feature. it ustilizes a custom
API endpoint that fetch the data of the selected product and the state of the application is 
managed by classes and local storage.

Once user clicks on "order now", all the info will be send to DaviDici Order system as a JSON.
