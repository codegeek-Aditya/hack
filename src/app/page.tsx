"use client";

import React from "react";
import Navbar from "~/components/landingPage/Navbar";
import SearchBox from "~/components/landingPage/mapbox/SearchBox";
import { useAtom } from "jotai";
import { destinationAtom, sourceAtom } from "~/store/atom";
import HospitalCard from "~/components/landingPage/HospitalCard";
import MapBox from "~/components/landingPage/mapbox/Mapbox";
import { useNearbyHospitals } from "~/hooks/useNearbyHospitals";
import { useNearbyNoJWT } from "~/hooks/useNearbyNoJWT";
import { Hospital } from "~/lib/types";

const LandingPage = () => {
  const [destination] = useAtom(destinationAtom);
  const [source] = useAtom(sourceAtom);

  const { hospitals, isLoading, error } = useNearbyNoJWT(source);

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <section className="mx-auto flex h-full max-w-7xl flex-col px-4">
          <div className="space-y-3 py-8">
            <h1 className="text-center font-sans text-4xl font-bold text-secondary-foreground/90">
              Find the Best Hospitals in Delhi
            </h1>
            <p className="mx-auto max-w-xl text-center text-lg text-muted-foreground">
              Instantly connect with top hospitals, book appointments, and check
              real-time bed availability.
            </p>
          </div>

          <div className="scrollbar flex min-h-0 flex-1 gap-x-4">
            <div className="flex w-1/2 flex-col gap-4">
              <SearchBox />
              <div className="scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
                {hospitals.map((hospital: Hospital) => (
                  <HospitalCard
                    key={hospital._id}
                    hospital={hospital}
                    isSelected={
                      destination.lat === hospital.location.coordinates[1] &&
                      destination.lng === hospital.location.coordinates[0]
                    }
                  />
                ))}
              </div>
            </div>
            <div className="w-1/2">
              <div className="flex h-full w-full flex-col items-center justify-center">
                {/* <h1 className="text-xl font-medium">Map nantar dakhau</h1>
                <p className="text-muted-foreground">mazhe tokens samptil :)</p> */}
                <MapBox onLocationUpdate={() => {}} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
