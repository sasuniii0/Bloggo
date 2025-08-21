paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
        height: 40
    },
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '10.00' // 👉 Replace with your plan price dynamically
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('✅ Payment completed by ' + details.payer.name.given_name);
            window.location.href = "confirmation.html"; // redirect to step 3
        });
    }
}).render('#paypal-button-container');