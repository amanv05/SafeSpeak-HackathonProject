/**
 * Home Page
 * 
 * PURPOSE:
 * - Explain what SafeSpeak is
 * - Emphasize privacy and anonymity
 * - Encourage users to report incidents
 * - Build trust before asking for sensitive information
 */

import { Link } from 'react-router-dom';
import { 
  Shield, 
  EyeOff, 
  Lock, 
  FileText, 
  Heart,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your Voice Matters.
              <br />
              Your Identity is Protected.
            </h1>
            
            <p className="mt-6 text-xl text-primary-100 leading-relaxed">
              SafeSpeak is a secure platform for anonymously reporting workplace 
              harassment, corruption, abuse, or injustice. No login required. 
              No personal data collected. Just your story.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Report an Incident
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Privacy Promise */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-medium text-gray-900">No Login Required</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-medium text-gray-900">No Name or Email Collected</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-medium text-gray-900">No IP Address Stored</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to make your voice heard safely
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                1. Describe the Incident
              </h3>
              <p className="mt-3 text-gray-600">
                Write about what happened. Include as much or as little detail 
                as you're comfortable sharing.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                2. AI Analysis
              </h3>
              <p className="mt-3 text-gray-600">
                Our AI analyzes your report to categorize the issue and 
                suggest relevant resources and next steps.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                3. Get Support
              </h3>
              <p className="mt-3 text-gray-600">
                Receive personalized suggestions for NGOs, legal aid, 
                hotlines, and other resources that can help.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Privacy Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Your Privacy is Our Priority
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                We understand how difficult it can be to speak up. That's why 
                SafeSpeak is built from the ground up with your privacy in mind.
                We never ask for personal information, and we never store 
                anything that could identify you.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EyeOff className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Completely Anonymous</h3>
                    <p className="text-gray-600">No account, no login, no tracking.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">No Personal Data</h3>
                    <p className="text-gray-600">We don't collect names, emails, phone numbers, or IP addresses.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Safe Reporting</h3>
                    <p className="text-gray-600">Your report helps others while keeping you protected.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 md:p-12">
              <blockquote className="text-xl md:text-2xl font-medium text-primary-900 leading-relaxed">
                "Speaking up shouldn't require courage alone. 
                It should be safe, simple, and supported."
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary-600" />
                <span className="font-semibold text-primary-700">SafeSpeak Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Speak Up?
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Your voice can make a difference. Report anonymously and safely.
          </p>
          <Link
            to="/report"
            className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Report an Incident
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}