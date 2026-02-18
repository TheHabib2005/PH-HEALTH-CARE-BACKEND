# PH-Health Care - Appointment Booking Workflow



## **Scenario 1: Book Appointment & Pay Now**

```

user click book appointment
             ⬇             
send in backend /api/appointment (POST)
. create a appointment data in db 
.status = pending
.create a checkout session url (frontend stripe payment ui link)
and send from backend as frontend response
             ⬇             
if frontend receive the response with url if exist then 
client auto recriect in session chekout url (page created by stripe)
             ⬇             
and after that payment success click pay button then if payment is actuly success then 
stripe webhook notify me 
             ⬇             
based on webhook event type update database 
.update status if success
.remove appoinment if failed payment also
.finaly redrict to frontend




## **Scenario 2: Book Appointment & Pay Leter**

user click book appointment with pay leter button  like (Pay Later)
             ⬇             
 
send in backend /api/appointment/pay-later (POST)
. create a appointment data in db 
.status = pending
.create a checkout session url
.store session url (payment page url) in appointment schema like (stripeSessionId)
and send from backend as frontend response 
booked success fully with pay Leter
             ⬇ 

             now if user come again to pay leter process complete 
             then 
                          ⬇             

 
send in backend /api/appointment/pay-later/pay (POST)
. get appoiment data form db  by id
.check validation
.check session expire or not 
then 
.send response frombackend like {
  success:true,
  paymenturl:sesion.url by stripe

}
             ⬇             
if payment succcess then smiller like action 
db update etc 
