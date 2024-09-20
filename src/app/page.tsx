// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Leaf, Recycle, Users, Coins, MapPin } from 'lucide-react';
import { Button } from '@greenwood/components/ui/button';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import ContractInteraction from '@greenwood/components/ContractInteraction';
import { getRecentReports, getAllRewards, getWasteCollectionTasks } from '@greenwood/utils/db/action';
import Image from 'next/image';
import logo from '@greenwood/components/Images/logo.png'; // Adjust the path if necessary
import quoteImage1 from '@greenwood/components/Images/1.jpg';
import quoteImage2 from '@greenwood/components/Images/6.jpg';
import quoteImage3 from '@greenwood/components/Images/3.jpg';
import quoteImage4 from '@greenwood/components/Images/4.jpg';
import quoteImage5 from '@greenwood/components/Images/5.jpg';

const poppins = Poppins({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  display: 'swap',
});

// Image carousel component
function ImageCarousel() {
  const images = [quoteImage1, quoteImage2, quoteImage3, quoteImage4, quoteImage5]; // List of images
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="flex items-center justify-between mb-12">
      <div className="flex-1 max-w-xs mr-4"> {/* Reduced the width of quote div */}
        <h2 className="text-3xl font-semibold text-green-600 mb-4">
          "The best way to predict the future is to create it."
        </h2>
        <p className="text-lg text-blue-600">
          Join us in making the world a better place through sustainable practices.
        </p>
      </div>
      <div className="relative w-60 h-60 flex-shrink-0"> {/* Increased size of the image */}
        <Image 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`} 
          className="rounded" 
          layout="fill" 
          objectFit="cover" 
        />
        {/* Beautiful arrow buttons for left and right */}
        <button 
          onClick={prevImage} 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextImage} 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}


// Animated Globe component
function AnimatedGlobe() {
  return (
    <div className="relative w-40 h-40 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-blue-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-blue-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-blue-200 opacity-80 animate-bounce"></div>
      <Image 
        src={logo} 
        alt="Logo" 
        className="absolute inset-0 m-auto h-40 w-40 animate-pulse" 
        width={80} 
        height={80} 
      />
    </div>
  );
}

// Main Home component
export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });

  useEffect(() => {
    async function fetchImpactData() {
      try {
        const reports = await getRecentReports(100); // Fetch last 100 reports
        const rewards = await getAllRewards();
        const tasks = await getWasteCollectionTasks(100); // Fetch last 100 tasks

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount.match(/(\d+(\.\d+)?)/);
          const amount = match ? parseFloat(match[0]) : 0;
          return total + amount;
        }, 0);

        const reportsSubmitted = reports.length;
        const tokensEarned = rewards.reduce((total, reward) => total + (reward.points || 0), 0);
        const co2Offset = wasteCollected * 0.5; // Assuming 0.5 kg CO2 offset per kg of waste

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10, // Round to 1 decimal place
          reportsSubmitted,
          tokensEarned,
          co2Offset: Math.round(co2Offset * 10) / 10 // Round to 1 decimal place
        });
      } catch (error) {
        console.error("Error fetching impact data:", error);
        // Set default values in case of error
        setImpactData({
          wasteCollected: 0,
          reportsSubmitted: 0,
          tokensEarned: 0,
          co2Offset: 0,
        });
      }
    }

    fetchImpactData();
  }, []);

  const login = () => {
    setLoggedIn(true);
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      <ImageCarousel /> {/* Add the image carousel above the AnimatedGlobe */}
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <h1 className="text-6xl font-bold mb-6 text-gray-800 tracking-tight">
          GreenWood <span className="text-blue-600">Waste Management</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Join our community in making waste management more efficient and rewarding!
        </p>
        {!loggedIn ? (
          <Button onClick={login} className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Link href="/report">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
              Report Waste
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>
      
      <section className="grid md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment by reporting and collecting waste."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions to waste management efforts."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community committed to sustainable practices."
        />
      </section>
      
      <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ImpactCard title="Waste Collected" value={`${impactData.wasteCollected} kg`} icon={Recycle} />
          <ImpactCard title="Reports Submitted" value={impactData.reportsSubmitted.toString()} icon={MapPin} />
          <ImpactCard title="Tokens Earned" value={impactData.tokensEarned.toString()} icon={Coins} />
          <ImpactCard title="CO2 Offset" value={`${impactData.co2Offset} kg`} icon={Leaf} />
        </div>
      </section>
    </div>
  );
}

// ImpactCard component
function ImpactCard({ title, value, icon: Icon }) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 1 }) : value;
  
  return (
    <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-md">
      <Icon className="h-10 w-10 text-blue-500 mb-4" />
      <p className="text-3xl font-bold mb-2 text-gray-800">{formattedValue}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

// FeatureCard component
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg">
      <div className="flex justify-center items-center mb-4">
        <Icon className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}
