// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB9x85hJMW22we8XlN1Q_Ca92Q5dV76IME",
    authDomain: "kota-6e667.firebaseapp.com",
    projectId: "kota-6e667",
    storageBucket: "kota-6e667.firebasestorage.app",
    messagingSenderId: "698838744468",
    appId: "1:698838744468:web:e5e718e9539dbd4431a381"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const DELIVERY_FEE = 20;

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('isAuthenticated')) {
        window.location.href = 'index.html';
        return;
    }
    
    displayCart();
    setupCheckoutModal();
});

function displayCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartContainer = document.getElementById('cartItems');
    const itemCountElement = document.getElementById('itemCount');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some items from the menu to get started!</p>
            </div>
        `;
        itemCountElement.textContent = '0 items';
        updateTotals(0);
        return;
    }

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    itemCountElement.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    cartContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <div class="price">R${(item.price * item.quantity).toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
    const total = subtotal + (subtotal > 0 ? DELIVERY_FEE : 0);
    totalElement.textContent = `R${total.toFixed(2)}`;
    
    checkoutBtn.disabled = subtotal === 0;
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeItem(itemId);
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
        updateCartCount(); // Update cart count in navigation
    }
}

function removeItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount(); // Update cart count in navigation
}



















// Initialize Yoco SDK globally
let yoco;
document.addEventListener('DOMContentLoaded', () => {
    try {
        yoco = new window.YocoSDK({
            publicKey: 'pk_test_0c72d315vnYeAqq89ce4',
            env: 'test'
        });
        console.log('Yoco SDK initialized successfully');
    } catch (error) {
        console.error('Error initializing Yoco SDK:', error);
    }
});



function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_FEE;

    document.getElementById('modal-subtotal').textContent = `Subtotal: R${subtotal.toFixed(2)}`;
    document.getElementById('modal-delivery').textContent = `Delivery Fee: R${DELIVERY_FEE.toFixed(2)}`;
    document.getElementById('modal-total').textContent = `Total: R${total.toFixed(2)}`;
}



async function handlePaymentCallback(result) {
    const submitButton = document.querySelector('.btn-place-order');
    const errorElement = document.getElementById('payment-error');

    try {
        if (result.error) {
            throw new Error(result.error.message || 'Payment failed');
        }

        submitButton.disabled = true;
        await processSuccessfulPayment(result);
        
    } catch (error) {
        console.error('Payment error:', error);
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        submitButton.disabled = false;
    }
}



const OPERATING_HOURS = {
    1: { // Monday
        open: { hour: 10, minute: 0 },
        close: { hour: 19, minute: 0 },
        lastOrder: { hour: 18, minute: 30 }
    },
    2: { // Tuesday
        open: { hour: 10, minute: 0 },
        close: { hour: 19, minute: 0 },
        lastOrder: { hour: 18, minute: 30 }
    },
    3: { // Wednesday
        open: { hour: 10, minute: 0 },
        close: { hour: 19, minute: 0 },
        lastOrder: { hour: 18, minute: 30 }
    },
    4: { // Thursday
        open: { hour: 10, minute: 0 },
        close: { hour: 19, minute: 0 },
        lastOrder: { hour: 18, minute: 30 }
    },
    5: { // Friday
        open: { hour: 10, minute: 0 },
        close: { hour: 19, minute: 0 },
        lastOrder: { hour: 18, minute: 30 }
    },
    6: { // Saturday
        open: { hour: 11, minute: 0 },
        close: { hour: 15, minute: 0 },
        lastOrder: { hour: 14, minute: 30 }
    },
    0: { // Sunday
        closed: true
        // open: { hour: 11, minute: 0 },
        // close: { hour: 23, minute: 0 },
        // lastOrder: { hour: 22, minute: 30 }
    }
};

const DELIVERY_ZONES = {
    uwc: {
        name: "UWC",
        vertices: [
            {lat: -33.9275827, lng: 18.6319859},
            {lat: -33.9267609, lng: 18.631114},
            {lat: -33.9281852, lng: 18.6289039},
            {lat: -33.9325294, lng: 18.6219516},
            {lat: -33.9342477, lng: 18.6193227},
            {lat: -33.9350488, lng: 18.6181318},
            {lat: -33.9354813, lng: 18.6184804},
            {lat: -33.9360354, lng: 18.6194622},
            {lat: -33.9359921, lng: 18.6218843},
            {lat: -33.9346886, lng: 18.622988},
            {lat: -33.9346312, lng: 18.6239629},
            {lat: -33.9352585, lng: 18.6254613},
            {lat: -33.9354243, lng: 18.6265547},
            {lat: -33.9358927, lng: 18.6269829},
            {lat: -33.9364323, lng: 18.6269391},
            {lat: -33.9362837, lng: 18.6276574},
            {lat: -33.9368381, lng: 18.6264873},
            {lat: -33.9372225, lng: 18.6268388},
            {lat: -33.9371468, lng: 18.6274128},
            {lat: -33.9370044, lng: 18.6285179},
            {lat: -33.9368575, lng: 18.62958},
            {lat: -33.9365854, lng: 18.629895},
            {lat: -33.9364163, lng: 18.631955},
            {lat: -33.9355796, lng: 18.6374481},
            {lat: -33.9346093, lng: 18.6371799},
            {lat: -33.9332029, lng: 18.6368151},
            {lat: -33.931387, lng: 18.636268},
            {lat: -33.9302297, lng: 18.6358174},
            {lat: -33.9297802, lng: 18.6355116},
            {lat: -33.9292906, lng: 18.6349564},
            {lat: -33.9284693, lng: 18.6335076},
            {lat: -33.927645, lng: 18.6320396},
            {lat: -33.9275827, lng: 18.6319859}
        ]
    },
    belhar8: {
        name: "308 On Kern, Unibel, HRP",
        vertices: [
            {lat: -33.9377723, lng: 18.6272389},
            {lat: -33.9378003, lng: 18.6272274},
            {lat: -33.9381828, lng: 18.6272687},
            {lat: -33.9383208, lng: 18.6272861},
            {lat: -33.9384231, lng: 18.6272781},
            {lat: -33.9385566, lng: 18.627203},
            {lat: -33.9386991, lng: 18.6272459},
            {lat: -33.9393755, lng: 18.6274068},
            {lat: -33.9393933, lng: 18.627498},
            {lat: -33.9392799, lng: 18.6287452},
            {lat: -33.9400364, lng: 18.6288631},
            {lat: -33.9408196, lng: 18.6290163},
            {lat: -33.9408418, lng: 18.6290485},
            {lat: -33.9408307, lng: 18.6293918},
            {lat: -33.9408418, lng: 18.6295206},
            {lat: -33.9408441, lng: 18.6296923},
            {lat: -33.9408174, lng: 18.6297593},
            {lat: -33.940755, lng: 18.6305394},
            {lat: -33.9417074, lng: 18.6307432},
            {lat: -33.9417964, lng: 18.6308183},
            {lat: -33.9416562, lng: 18.632256},
            {lat: -33.9407016, lng: 18.632256},
            {lat: -33.9404969, lng: 18.6320146},
            {lat: -33.9403816, lng: 18.6322132},
            {lat: -33.9400123, lng: 18.6321488},
            {lat: -33.9397541, lng: 18.6321086},
            {lat: -33.939694, lng: 18.6320871},
            {lat: -33.9395516, lng: 18.6320684},
            {lat: -33.9393914, lng: 18.6320415},
            {lat: -33.9393536, lng: 18.6320228},
            {lat: -33.9392134, lng: 18.6319584},
            {lat: -33.9391865, lng: 18.6319394},
            {lat: -33.9390574, lng: 18.631757},
            {lat: -33.9389996, lng: 18.6318509},
            {lat: -33.9388438, lng: 18.6319207},
            {lat: -33.9385501, lng: 18.6318938},
            {lat: -33.9383053, lng: 18.6318563},
            {lat: -33.9379092, lng: 18.6317785},
            {lat: -33.9376933, lng: 18.6317356},
            {lat: -33.9375954, lng: 18.6317114},
            {lat: -33.9374285, lng: 18.6316766},
            {lat: -33.9373306, lng: 18.6315827},
            {lat: -33.9373106, lng: 18.6315103},
            {lat: -33.9373061, lng: 18.6313949},
            {lat: -33.9373462, lng: 18.6310463},
            {lat: -33.9374195, lng: 18.6304458},
            {lat: -33.9374307, lng: 18.6303238},
            {lat: -33.9374863, lng: 18.6298705},
            {lat: -33.9375231, lng: 18.6297388},
            {lat: -33.9375943, lng: 18.629138},
            {lat: -33.9376744, lng: 18.628564},
            {lat: -33.9378168, lng: 18.6274053},
            {lat: -33.9377723, lng: 18.6272389}
        ]
    },
    southPointOrchard: {
        name: "South Point the Orchard",
        vertices: [
            {lat: -33.94160936978254, lng: 18.62808115476182},
            {lat: -33.94146903574156, lng: 18.6290641103443},
            {lat: -33.94092084551887, lng: 18.62895383809768},
            {lat: -33.94054767987043, lng: 18.62886736492873},
            {lat: -33.9405050432964, lng: 18.62878263835973},
            {lat: -33.9406375340023, lng: 18.62781312786811},
            {lat: -33.94071916966324, lng: 18.62781466516865},
            {lat: -33.94079626451287, lng: 18.62717303556204},
            {lat: -33.94099572564106, lng: 18.62720253612952},
            {lat: -33.94121188019938, lng: 18.62723826569818},
            {lat: -33.94129138670063, lng: 18.62725034737268},
            {lat: -33.94119593782204, lng: 18.6279703373466},
            {lat: -33.94160936978254, lng: 18.62808115476182}
        ]
    },


    
    cput: {
        name: "CPUT",
        vertices: [
            {lat: -33.9289683, lng: 18.6357528},
            {lat: -33.9297406, lng: 18.6361873},
            {lat: -33.9305506, lng: 18.6365736},
            {lat: -33.9326782, lng: 18.6372924},
            {lat: -33.9342626, lng: 18.6377645},
            {lat: -33.9349748, lng: 18.6380434},
            {lat: -33.9349748, lng: 18.6384297},
            {lat: -33.9350282, lng: 18.6389339},
            {lat: -33.9349036, lng: 18.6399317},
            {lat: -33.9353664, lng: 18.6402321},
            {lat: -33.9351216, lng: 18.6420185},
            {lat: -33.9350415, lng: 18.6429733},
            {lat: -33.9350549, lng: 18.6439845},
            {lat: -33.9349258, lng: 18.6451674},
            {lat: -33.9348435, lng: 18.6458326},
            {lat: -33.9345909, lng: 18.6459365},
            {lat: -33.934705, lng: 18.6460153},
            {lat: -33.934722, lng: 18.6461996},
            {lat: -33.9346499, lng: 18.6463516},
            {lat: -33.9347055, lng: 18.6468706},
            {lat: -33.9346076, lng: 18.6476055},
            {lat: -33.9345453, lng: 18.6475867},
            {lat: -33.9321774, lng: 18.6475653},
            {lat: -33.9309846, lng: 18.6475224},
            {lat: -33.9303526, lng: 18.647517},
            {lat: -33.9300633, lng: 18.6475438},
            {lat: -33.9298007, lng: 18.6453444},
            {lat: -33.9296538, lng: 18.6440891},
            {lat: -33.9295826, lng: 18.6434669},
            {lat: -33.9294134, lng: 18.6424583},
            {lat: -33.9292888, lng: 18.6420185},
            {lat: -33.9285232, lng: 18.6405164},
            {lat: -33.9284876, lng: 18.6401946},
            {lat: -33.9288715, lng: 18.6401584},
            {lat: -33.9289581, lng: 18.6401648},
            {lat: -33.9290668, lng: 18.6401336},
            {lat: -33.9290176, lng: 18.639979},
            {lat: -33.9291998, lng: 18.6399371},
            {lat: -33.9290395, lng: 18.6381132},
            {lat: -33.9289683, lng: 18.6357528}
        ]
    }
};


// Ray casting algorithm to check if point is in polygon
function isPointInPolygon(point, polygon) {
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}


// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}


// Get nearest zone and check if point is in any delivery zone
function formatDistance(distanceInKm) {
    if (distanceInKm < 1) {
        // Convert to meters and round to nearest 10m
        const meters = Math.round(distanceInKm * 1000 / 10) * 10;
        return `${meters}m`;
    }
    // Keep km format for distances >= 1km, rounded to 1 decimal
    return `${distanceInKm.toFixed(1)}km`;
}

function checkDeliveryZone(latitude, longitude) {
    const point = { lat: latitude, lng: longitude };
    let nearestZone = null;
    let shortestDistance = Infinity;
    let isInDeliveryZone = false;

    // Check each zone
    for (const [zoneKey, zone] of Object.entries(DELIVERY_ZONES)) {
        // Check if point is in this polygon
        if (isPointInPolygon(point, zone.vertices)) {
            isInDeliveryZone = true;
            nearestZone = zone.name;
            shortestDistance = 0;
            break;
        }

        // If not in polygon, find distance to polygon center
        const centerLat = zone.vertices.reduce((sum, v) => sum + v.lat, 0) / zone.vertices.length;
        const centerLng = zone.vertices.reduce((sum, v) => sum + v.lng, 0) / zone.vertices.length;
        const distance = calculateDistance(latitude, longitude, centerLat, centerLng);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestZone = zone.name;
        }
    }

    const formattedDistance = formatDistance(shortestDistance);

    return {
        verified: isInDeliveryZone,
        message: isInDeliveryZone 
            ? "Location verified for delivery"
            : `Delivery is not available at your location. We only deliver to authorized zones. The nearest delivery zone is ${nearestZone} (${formattedDistance} away).`,
        nearestZone: {
            zoneName: nearestZone,
            distance: shortestDistance,
            formattedDistance: formattedDistance
        }
    };
}

// Verify delivery location
async function verifyDeliveryLocation(coordinates) {
    try {
        const { latitude, longitude } = coordinates;
        return checkDeliveryZone(latitude, longitude);
    } catch (error) {
        console.error('Location verification error:', error);
        throw new Error('Unable to verify delivery location. Please ensure location services are enabled.');
    }
}
















function checkOperatingHours() {
    const now = new Date();
    const day = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's Sunday (closed)
    if (OPERATING_HOURS[day].closed) {
        throw new Error("We're closed on Sundays. Please place your order during our operating hours:\n" +
            "Monday-Friday: 10am – 7pm (last order 6:30pm)\n" +
            "Saturday: 11am-3pm (last order 2:30pm)\n" +
            "Sunday: Closed");
    }

    const hours = OPERATING_HOURS[day];
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const openTimeInMinutes = hours.open.hour * 60 + hours.open.minute;
    const lastOrderTimeInMinutes = hours.lastOrder.hour * 60 + hours.lastOrder.minute;

    // Check if we're before opening time
    if (currentTimeInMinutes < openTimeInMinutes) {
        throw new Error(`We're currently closed. We open at ${formatTime(hours.open)}. Please place your order during our operating hours.`);
    }

    // Check if it's past the last order time
    if (currentTimeInMinutes > lastOrderTimeInMinutes) {
        // If it's already past closing time for today, show tomorrow's opening time
        const nextDay = (day + 1) % 7;
        const tomorrowHours = OPERATING_HOURS[nextDay];
        const tomorrowOpenTime = tomorrowHours.closed ? 
            "We're closed tomorrow (Sunday). We'll open again on Monday at 10am." :
            `We'll open tomorrow at ${formatTime(tomorrowHours.open)}`;

        throw new Error(`Sorry, we've stopped taking orders for today. Last order time was ${formatTime(hours.lastOrder)}.\n\n${tomorrowOpenTime}`);
    }

    return true;
}

function formatTime({ hour, minute }) {
    const period = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute}${period}`;
}


async function performPrePaymentChecks() {
    const userId = localStorage.getItem('userId');
    const db = firebase.firestore();

    // Check operating hours first
    checkOperatingHours();

    // Check for active orders
    const hasActiveOrders = await checkActiveOrders(userId);
    if (hasActiveOrders) {
        throw new Error('You have an active order that is being processed or delivered. Please wait for it to be completed before placing a new order.');
    }

    

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Check address fields
    const requiredFields = ['street', 'suburb', 'city', 'postalCode', 'province', 'country'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    if (missingFields.length > 0) {
        throw new Error(`Please complete your address in Profile:\n${missingFields.join(', ')}`);
    }

    // Check coordinates
    if (!userData.coordinates?.latitude || !userData.coordinates?.longitude) {
        throw new Error('Please set your delivery location coordinates in Profile');
    }

     // First verify if saved address is in delivery zone
     const deliveryZoneCheck = await verifyDeliveryLocation(userData.coordinates);
     if (!deliveryZoneCheck.verified) {
         throw new Error(deliveryZoneCheck.message);
     }
     
    // Verify location
    const locationVerification = await verifyLocation(userData.coordinates);
    if (!locationVerification.verified) {
        throw new Error(
            `Order cannot be placed. Your current location is ${locationVerification.distance.toFixed(1)}km away from your saved delivery address.\n\n` +
            `For security reasons, orders can only be placed when you are within 500m of your saved delivery address.\n\n` +
            `Please update your delivery address in Profile if you've moved, or try placing the order from your saved address location.`
        );
    }

    // Check phone number
    if (!userData.phone) {
        throw new Error('Please add your phone number in Profile');
    }
}

















// ... previous Firebase config and constants ...

const LOCATION_THRESHOLD = 0.1; // Roughly 1km in decimal degrees

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            if (permissionStatus.state === 'denied') {
                reject(new Error('Location access is required to place orders. Please enable location access in your browser settings and try again.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage;
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access is required to place orders. Please enable location access in your browser settings and try again.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable. Please try again.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred while getting location. Please try again.';
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    });
}

// Update the LOCATION_THRESHOLD constant to 0.5 km

async function verifyLocation(savedCoordinates) {
    try {
        const currentLocation = await getCurrentLocation();
        const distance = calculateDistance(
            savedCoordinates.latitude,
            savedCoordinates.longitude,
            currentLocation.latitude,
            currentLocation.longitude
        );

        return {
            verified: distance <= LOCATION_THRESHOLD,
            distance: distance,
            current: currentLocation,
            saved: savedCoordinates
        };
    } catch (error) {
        throw error;
    }
}

async function checkActiveOrders(userId) {
    const db = firebase.firestore();
    
    try {
        const activeOrders = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', 'in', ['confirmed', 'delivering'])
            .get();

        return !activeOrders.empty;
    } catch (error) {
        console.error('Error checking active orders:', error);
        throw error;
    }
}

// Update the styles with extra small screen handling
// Update the styles with much larger spacing for small screens
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }
    
    .modal-content {
        position: relative;
        background-color: #fff;
        margin: 15% auto;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        z-index: 1001;
    }
    
    /* Yoco specific styles */
    .yoco-payment-overlay {
        z-index: 60000 !important;
    }
    
    iframe[id^='yoco-3ds-modal'] {
        z-index: 60001 !important;
    }
    
    .yoco-payment-overlay-modal {
        z-index: 60002 !important;
    }

    /* Responsive positioning for tablets and medium-sized phones */
    @media screen and (max-width: 768px) {
        iframe[id^='yoco-payment-form'] {
            margin-top: 120px !important;
            top: 25% !important;
            transform: translateY(-10%) !important;
            max-height: 85vh !important;
            position: fixed !important;
        }
    }

    /* Extra specific styling for very small screens */
    @media screen and (max-width: 420px) {
        iframe[id^='yoco-payment-form'] {
            margin-top: 200px !important; /* Significantly increased margin */
            top: 0 !important; /* Remove top percentage */
            transform: none !important; /* Remove transform */
            max-height: 75vh !important; /* Reduced max height */
            position: fixed !important;
            padding-top: 20px !important; /* Add padding at the top */
        }++
    }
`;
document.head.appendChild(styleSheet);

// Update the handleCheckout function with increased spacing
async function handleCheckout(event) {
    event.preventDefault();
    const submitButton = document.querySelector('.btn-place-order');
    const errorElement = document.getElementById('payment-error');
    const modal = document.getElementById('checkoutModal');
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Checking requirements...';
        errorElement.style.display = 'none';
        
        await performPrePaymentChecks();
        
        submitButton.textContent = 'Processing...';
        
        if (!yoco) {
            throw new Error('Payment system not initialized');
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            throw new Error('Cart is empty');
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + DELIVERY_FEE;

        // Hide the checkout modal while Yoco popup is active
        modal.style.visibility = 'hidden';

        // Get window dimensions and calculate positioning
        const windowWidth = window.innerWidth;
        const isVerySmallScreen = windowWidth <= 420;
        const isMobile = windowWidth <= 768;
        const headerHeight = isVerySmallScreen ? 200 : 120; // Significantly increased header spacing
        
        // Initialize Yoco popup with increased spacing
        // Reduce navbar height
        // Reduce navbar height
        document.querySelector('.navbar').classList.add('payment-active');
        
        // Initialize Yoco popup with dynamic positioning
        yoco.showPopup({
            amountInCents: Math.round(total * 100),
            currency: 'ZAR',
            name: "Sanne's Palace Order",
            description: `Order Total: R${total.toFixed(2)}`,
            position: {
                top: window.innerWidth <= 420 ? 150 : window.innerWidth <= 768 ? 120 : undefined,
            },
            modalStyles: {
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 99998
                },
                modal: {
                    zIndex: 99999,
                    marginTop: window.innerWidth <= 420 ? '150px' : '120px'
                }
            },
            callback: async function(result) {
                // Show the modal again after Yoco popup closes
                modal.style.visibility = 'visible';
                
                if (result.error) {
                    errorElement.textContent = result.error.message;
                    errorElement.style.display = 'block';
                    submitButton.disabled = false;
                    submitButton.textContent = 'Pay and Place Order';
                    return;
                }
                submitButton.textContent = 'Processing Order...';
                await processSuccessfulPayment(result);
            }
        });
        
    } catch (error) {
        // Show the modal again in case of error
        modal.style.visibility = 'visible';
        
        console.error('Checkout error:', error);
        if (error.message.includes('Please complete your address') || 
            error.message.includes('Please set your delivery location') ||
            error.message.includes('Please add your phone number')) {
            alert(error.message + '\n\nRedirecting to Profile page...');
            window.location.href = 'profile.html';
            return;
        }
        
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Pay and Place Order';
    }
}


// Update the close modal function to reset visibility
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const paymentForm = document.getElementById('payment-form');
    const errorElement = document.getElementById('payment-error');
    const submitButton = document.querySelector('.btn-place-order');
    
    // Reset everything when closing
    paymentForm.innerHTML = '';
    errorElement.style.display = 'none';
    errorElement.textContent = '';
    submitButton.disabled = false;
    submitButton.textContent = 'Pay and Place Order';
    
    modal.style.display = 'none';
    modal.style.visibility = 'visible'; // Reset visibility
    document.body.style.overflow = 'auto';
}




async function openCheckoutModal() {
    if (!await checkLocationPermission()) {
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset any previous error messages
    const errorElement = document.getElementById('payment-error');
    errorElement.style.display = 'none';
    errorElement.textContent = '';
    
    // Update the order summary
    updateOrderSummary();
    
    // Remove any existing payment form
    const paymentForm = document.getElementById('payment-form');
    paymentForm.innerHTML = '';
}


// Add this CSS to your styles

document.head.appendChild(styleSheet);



// Update modal setup to ensure proper layering
function setupCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('checkoutForm');
    
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeBtn.addEventListener('click', closeCheckoutModal);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCheckout(e);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeCheckoutModal();
        }
    });
}


















async function initializePaymentForm() {
    const paymentContainer = document.getElementById('payment-form');
    
    try {
        if (!yoco) {
            throw new Error('Payment system not initialized');
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            throw new Error('Cart is empty');
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + DELIVERY_FEE;

        // Create Yoco popup
        yoco.showPopup({
            amountInCents: Math.round(total * 100),
            currency: 'ZAR',
            name: "Sanne's Palace Order",
            description: `Order Total: R${total.toFixed(2)}`,
            callback: async function(result) {
                const submitButton = document.querySelector('.btn-place-order');
                const errorElement = document.getElementById('payment-error');
                
                if (result.error) {
                    errorElement.textContent = result.error.message;
                    errorElement.style.display = 'block';
                    submitButton.disabled = false;
                    submitButton.textContent = 'Pay and Place Order';
                    return;
                }
                
                submitButton.textContent = 'Processing Order...';
                await processSuccessfulPayment(result);
            }
        });
    } catch (error) {
        console.error('Payment form initialization error:', error);
        throw error;
    }
}

async function processSuccessfulPayment(paymentResult) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const userId = localStorage.getItem('userId');
        const db = firebase.firestore();
        
        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + DELIVERY_FEE;
        const instructions = document.getElementById('instructions').value;

        // Create order object
        const order = {
            userId,
            items: cart,
            address: {
                street: userData.street,
                suburb: userData.suburb,
                city: userData.city,
                postalCode: userData.postalCode,
                province: userData.province,
                country: userData.country,
                coordinates: userData.coordinates
            },
            phone: userData.phone,
            instructions,
            subtotal,
            deliveryFee: DELIVERY_FEE,
            total,
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            payment: {
                status: 'completed',
                timestamp: new Date().toISOString(),
                reference: paymentResult.id
            }
        };

        // Save order to Firestore
        const orderRef = await db.collection('orders').add(order);
        localStorage.setItem('latestOrderId', orderRef.id);

        // Show success message
        const modal = document.getElementById('checkoutModal');
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <div class="success-message" style="text-align: center; padding: 2rem;">
                <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2 style="color: #4CAF50; margin-bottom: 1rem;">Order Placed Successfully!</h2>
                <p style="margin-bottom: 0.5rem;">Your order has been confirmed and is being processed.</p>
                <p style="margin-bottom: 1rem;">Order Reference: #${orderRef.id}</p>
                <p>Redirecting to order tracking...</p>
            </div>
        `;

        // Clear cart and update UI
        localStorage.removeItem('cart');
        updateCartCount();

        // Redirect to tracking page after 3 seconds
        setTimeout(() => {
            window.location.href = 'track.html';
        }, 3000);

    } catch (error) {
        console.error('Error processing order:', error);
        const errorElement = document.getElementById('payment-error');
        errorElement.textContent = 'Error processing order. Please try again.';
        errorElement.style.display = 'block';
        const submitButton = document.querySelector('.btn-place-order');
        submitButton.disabled = false;
        submitButton.textContent = 'Pay and Place Order';
    }
}



























// Add this helper function to check for address completeness
function checkAddressCompleteness(userData) {
    const requiredFields = ['street', 'suburb', 'city', 'postalCode', 'province', 'country'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Please complete your address in Profile:\n${missingFields.join(', ')}`);
    }
    
    if (!userData.coordinates?.latitude || !userData.coordinates?.longitude) {
        throw new Error('Please set your delivery location coordinates in Profile');
    }
    
    if (!userData.phone) {
        throw new Error('Please add your phone number in Profile');
    }
}














// Add this function to check location permission when the checkout modal opens
async function checkLocationPermission() {
    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
            alert('Location access is required to place orders. Please enable location access in your browser settings and try again.');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
    }
}


// New function to update order summary
function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_FEE;

    document.getElementById('modal-subtotal').textContent = `Subtotal: R${subtotal.toFixed(2)}`;
    document.getElementById('modal-delivery').textContent = `Delivery Fee: R${DELIVERY_FEE.toFixed(2)}`;
    document.getElementById('modal-total').textContent = `Total: R${total.toFixed(2)}`;
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('isAuthenticated')) {
        window.location.href = 'index.html';
        return;
    }
    displayCart();
    setupCheckoutModal();
});
