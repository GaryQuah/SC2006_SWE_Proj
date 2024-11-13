import random
import smtplib
from email.message import EmailMessage

def otp_validation(to_mail):
    otp = ""
    for i in range(6):
        otp += str(random.randint(0,9))

    print("OTP = " + otp)

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()

    from_mail = 'outdoo.otp@gmail.com'
    server.login(from_mail, 'hrtg ozgr klhi gcio')

    msg = EmailMessage()
    msg['Subject'] = "OTP Verification"
    msg['From'] = from_mail
    msg['To'] = to_mail
    msg.set_content("Your OTP is: " + otp)

    server.send_message(msg)
    server.quit()
    
    return otp
    
    
    
    
    '''server.send_message(msg)
    end = False
    while(not end):

        input_otp = input("Enter OTP: ")
        if input_otp == otp:
            print("OTP Verified")
            end = True
            return end
        else:
            print("Invalid OTP")
            return end'''
