const privacyPolicySections = [
  {
    title: '1. Information We Collect',
    paragraphs: [
      'We collect the information you provide when you create an account, including your full name, email address, telephone number, password, account type, profile details, route details, alerts, and messages sent through Snow Fleet Management.',
      'When you use the platform, we also collect service usage data such as search activity, booking history, device and browser information, IP address, rough location data derived from your postcode or booking address, and records needed to investigate fraud, abuse, or service disputes.'
    ]
  },
  {
    title: '2. How We Use Your Data',
    paragraphs: [
      'We use your personal data to create and administer your account, match customers with service providers, process bookings, send service updates, operate customer support, enforce platform rules, prevent fraud, and improve the reliability and safety of the marketplace.',
      'If you register as a service provider, selected profile and service information may be displayed publicly so customers can evaluate your offering. We do not sell your personal data to third parties for independent marketing purposes.'
    ]
  },
  {
    title: '3. Sharing and Retention',
    paragraphs: [
      'We share data only where necessary to operate the service, including with payment providers, cloud hosting providers, analytics and email tools, law enforcement where legally required, and other users where the sharing is essential to complete a booking or respond to a dispute.',
      'We retain personal data only for as long as reasonably necessary to provide the service, comply with legal obligations, resolve disputes, enforce our agreements, and maintain business records. We may keep limited archived records where the law or legitimate business needs require it.'
    ]
  },
  {
    title: '4. Your Rights',
    paragraphs: [
      'You may request access to, correction of, deletion of, or export of your personal data, and you may object to or restrict certain processing where applicable law gives you those rights. You may also close your account at any time, although some records may need to be retained for legal, security, or financial reporting reasons.',
      'Privacy requests and complaints can be sent to privacy@snowfleetmanagement.uk. We will review and respond within a reasonable period and may request proof of identity before acting on sensitive requests.'
    ]
  },
  {
    title: '5. Security and International Processing',
    paragraphs: [
      'We use reasonable administrative, technical, and organisational measures to protect personal data, but no platform can guarantee absolute security. You are responsible for keeping your login credentials confidential and for reporting any suspected unauthorised access promptly.',
      'Your information may be processed in countries other than your own when our service providers operate internationally. Where that happens, we will take reasonable steps to ensure appropriate safeguards are in place.'
    ]
  }
]

const termsSections = [
  {
    title: '1. Platform Role',
    paragraphs: [
      'Snow Fleet Management provides an operations portal for authorised fleet managers, drivers, and customers. Unless explicitly stated otherwise, Snow Fleet Management is not the direct supplier of transport or delivery services.',
      'Providers are solely responsible for the accuracy of their listings, the quality and legality of their services, maintaining any required licences or insurance, and complying with all applicable laws and professional obligations.'
    ]
  },
  {
    title: '2. Account Responsibilities',
    paragraphs: [
      'You must provide accurate information, keep it up to date, maintain the confidentiality of your login credentials, and use the platform only for lawful and legitimate business or personal purposes. You must not impersonate another person, create accounts using false information, scrape the platform, or interfere with platform security.',
      'We may suspend, restrict, or terminate accounts that violate these terms, create legal risk, are associated with fraud or abuse, or harm the experience or safety of other users.'
    ]
  },
  {
    title: '3. Bookings, Payments, and Cancellations',
    paragraphs: [
      'Customers are responsible for reviewing provider information before making a booking and for providing accurate booking details, access instructions, and any relevant safety information. Providers are responsible for honouring confirmed bookings unless cancellation is reasonably necessary.',
      'Transport charges, cancellation handling, delivery updates, and service timing may vary by route or customer agreement. By using the portal, you agree that Snow Fleet Management may process operational updates and service records required to coordinate deliveries.'
    ]
  },
  {
    title: '4. Reviews, Content, and Conduct',
    paragraphs: [
      'You remain responsible for content you submit, including profile descriptions, service listings, messages, and reviews. Content must be accurate, lawful, and non-defamatory, and it must not infringe the rights of others or contain spam, harassment, threats, or deceptive material.',
      'We may moderate, remove, or refuse content that breaches these terms, exposes the platform to risk, or undermines trust in the marketplace. Reviews must reflect genuine service experiences and must not be manipulated or exchanged for undisclosed incentives.'
    ]
  },
  {
    title: '5. Liability and Changes',
    paragraphs: [
      'To the maximum extent permitted by law, Snow Fleet Management is provided on an as-is and as-available basis without guarantees that the service will be uninterrupted, error-free, or suitable for every purpose. We are not liable for indirect, incidental, special, consequential, or punitive losses arising from use of the portal.',
      'We may update these terms from time to time. Continued use of the platform after an update takes effect means you accept the revised terms. If you do not agree to a change, you must stop using the platform and close your account.'
    ]
  }
]

export const RegisterPage = () => {
  return (
    <div class="register-page">
      <div class="register-card" style="max-width: 1120px; margin: 0 auto; background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 18px 45px rgba(0,0,0,0.2);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="margin: 0; font-size: 2rem;">❄️</h1>
          <h2 style="margin: 0.5rem 0 0 0; font-size: 2rem; color: #1f2937;">Create Account</h2>
          <p style="margin: 0.75rem auto 0 auto; max-width: 700px; color: #4b5563; line-height: 1.6;">Create your Snow Fleet Management account and review the full Privacy Policy and Terms and Conditions before continuing.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; align-items: start;">
          <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
            <form method="post" action="/api/auth/register" style="display: grid; gap: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  required 
                  placeholder="John Smith"
                  maxlength="50"
                  pattern="[A-Za-z\s'\-]{1,50}"
                  title="Letters, spaces, apostrophes and hyphens only (max 50 chars)"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;"
                />
              </div>

              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="your@email.com"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;"
                />
              </div>

              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="+44 20 1234 5678"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;"
                />
              </div>

              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  placeholder="••••••••"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;"
                />
              </div>

              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Account Type</label>
                <select name="role" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;">
                  <option value="">Select an option</option>
                  <option value="customer">Customer - manage delivery requirements</option>
                  <option value="provider">Provider - manage services and bookings</option>
                  <option value="driver">Driver - accept and service routes</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Driver Licence Number</label>
                  <input type="text" name="licence_number" placeholder="Required for driver accounts" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;" />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Licence Expiry</label>
                  <input type="date" name="licence_expiry" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: white;" />
                </div>
              </div>

              <div style="display: grid; gap: 0.75rem; padding: 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; color: #1e3a8a;">
                <label style="display: flex; gap: 0.75rem; align-items: flex-start; cursor: pointer;">
                  <input type="checkbox" name="accept_terms" value="true" required style="margin-top: 0.2rem;" />
                  <span style="line-height: 1.5; color: #1f2937;">I have read and agree to the full Terms and Conditions shown on this page.</span>
                </label>
                <label style="display: flex; gap: 0.75rem; align-items: flex-start; cursor: pointer;">
                  <input type="checkbox" name="accept_privacy" value="true" required style="margin-top: 0.2rem;" />
                  <span style="line-height: 1.5; color: #1f2937;">I have read and agree to the Privacy Policy, including how Snow Fleet Management collects, uses, and stores my personal data.</span>
                </label>
              </div>

              <button 
                type="submit" 
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.85rem; border: none; border-radius: 8px; font-weight: bold; font-size: 1.05rem; cursor: pointer;"
              >
                Create Account
              </button>
            </form>

            <div style="text-align: center; margin-top: 1.5rem;">
              <p style="margin: 0; color: #666;">Already have an account? <a href="/auth/login" style="color: #667eea; text-decoration: none; font-weight: bold;">Login here</a></p>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.95rem; color: #4b5563;">
              <p style="margin: 0;"><strong>For Customers:</strong> Browse services, make bookings, leave reviews.</p>
              <p style="margin: 0.5rem 0 0 0;"><strong>For Drivers:</strong> View assigned routes, monitor vehicles, and update delivery activity.</p>
              <p style="margin: 0.5rem 0 0 0;"><strong>For Fleet Admins:</strong> Manage users, routes, vehicles, alerts, and monitoring data.</p>
            </div>
          </div>

          <div style="display: grid; gap: 1rem;">
            <section style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; background: #ffffff; max-height: 740px; overflow-y: auto;">
              <h3 style="margin: 0 0 0.75rem 0; color: #111827;">Privacy Policy</h3>
              <p style="margin: 0 0 1rem 0; color: #4b5563; line-height: 1.6;">Effective date: 15 April 2026. This Privacy Policy explains how Snow Fleet Management collects, uses, discloses, and protects personal data when you use our operations portal.</p>
              {privacyPolicySections.map((section) => (
                <div style="margin-bottom: 1rem;" key={section.title}>
                  <h4 style="margin: 0 0 0.5rem 0; color: #1f2937;">{section.title}</h4>
                  {section.paragraphs.map((paragraph) => (
                    <p style="margin: 0 0 0.75rem 0; color: #4b5563; line-height: 1.65;" key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </section>

            <section style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; background: #ffffff; max-height: 740px; overflow-y: auto;">
              <h3 style="margin: 0 0 0.75rem 0; color: #111827;">Terms and Conditions</h3>
              <p style="margin: 0 0 1rem 0; color: #4b5563; line-height: 1.6;">Effective date: 15 April 2026. These Terms and Conditions govern access to and use of Snow Fleet Management by fleet managers, drivers, customers, and other authorised visitors.</p>
              {termsSections.map((section) => (
                <div style="margin-bottom: 1rem;" key={section.title}>
                  <h4 style="margin: 0 0 0.5rem 0; color: #1f2937;">{section.title}</h4>
                  {section.paragraphs.map((paragraph) => (
                    <p style="margin: 0 0 0.75rem 0; color: #4b5563; line-height: 1.65;" key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
