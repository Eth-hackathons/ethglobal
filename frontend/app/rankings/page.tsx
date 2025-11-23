'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityRankingCard } from "@/components/CommunityRankingCard";
import { UserRankingCard } from "@/components/UserRankingCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, TrendingUp } from "lucide-react";

interface CommunityRanking {
  rank: number;
  id: string;
  name: string;
  description: string;
  totalProfit: number;
  successfulBets: number;
  memberCount: number;
}

interface UserRanking {
  rank: number;
  address: string;
  totalProfit: number;
  winRate: number;
  totalBets: number;
}

export default function RankingsPage() {
  const [communityRankings, setCommunityRankings] = useState<CommunityRanking[]>([]);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState("communities");

  // Mock data and API calls
  useEffect(() => {
    fetchCommunityRankings();
    fetchUserRankings();
  }, []);

  const fetchCommunityRankings = async () => {
    setIsLoadingCommunities(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData: CommunityRanking[] = [
        {
          rank: 1,
          id: "1",
          name: "Crypto Predictions",
          description: "The premier community for cryptocurrency market predictions. We analyze charts, fundamentals, and market sentiment to make informed bets.",
          totalProfit: 125430,
          successfulBets: 89,
          memberCount: 2453,
        },
        {
          rank: 2,
          id: "2",
          name: "Sports Analytics",
          description: "Data-driven sports betting using advanced statistics and machine learning models to predict outcomes.",
          totalProfit: 98760,
          successfulBets: 67,
          memberCount: 1876,
        },
        {
          rank: 3,
          id: "3",
          name: "DeFi Degen Club",
          description: "High-risk, high-reward DeFi protocol predictions. Not for the faint of heart!",
          totalProfit: 87320,
          successfulBets: 54,
          memberCount: 1432,
        },
        {
          rank: 4,
          id: "4",
          name: "Political Forecasters",
          description: "Predicting election outcomes and political events with careful analysis.",
          totalProfit: 72150,
          successfulBets: 48,
          memberCount: 1205,
        },
        {
          rank: 5,
          id: "5",
          name: "Tech IPO Watchers",
          description: "Tracking and predicting technology company IPO performance.",
          totalProfit: 65430,
          successfulBets: 42,
          memberCount: 987,
        },
      ];

      setCommunityRankings(mockData);
    } catch (error) {
      console.error("Failed to fetch community rankings:", error);
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const fetchUserRankings = async () => {
    setIsLoadingUsers(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData: UserRanking[] = [
        {
          rank: 1,
          address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          totalProfit: 45230,
          winRate: 78,
          totalBets: 156,
        },
        {
          rank: 2,
          address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          totalProfit: 38760,
          winRate: 72,
          totalBets: 143,
        },
        {
          rank: 3,
          address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
          totalProfit: 32450,
          winRate: 69,
          totalBets: 128,
        },
        {
          rank: 4,
          address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
          totalProfit: 28900,
          winRate: 65,
          totalBets: 115,
        },
        {
          rank: 5,
          address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
          totalProfit: 25670,
          winRate: 68,
          totalBets: 102,
        },
        {
          rank: 6,
          address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
          totalProfit: 23100,
          winRate: 61,
          totalBets: 98,
        },
        {
          rank: 7,
          address: "0x3e66B66Fd1d0b02fDa6C811Da9E0547970DB2f21",
          totalProfit: 21450,
          winRate: 64,
          totalBets: 89,
        },
      ];

      setUserRankings(mockData);
    } catch (error) {
      console.error("Failed to fetch user rankings:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const totalCommunities = communityRankings.length;
  const totalUsers = userRankings.length;
  const totalVolume = communityRankings.reduce((sum, c) => sum + c.totalProfit, 0);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Global Rankings</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Top performing communities and users in the prediction markets
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{totalCommunities}</div>
              <div className="text-sm text-muted-foreground">Total Communities</div>
            </Card>
            <Card className="p-6 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </Card>
            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1 text-success">
                ${totalVolume.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="communities">Top Communities</TabsTrigger>
              <TabsTrigger value="users">Top Users</TabsTrigger>
            </TabsList>

            {/* Community Rankings */}
            <TabsContent value="communities" className="space-y-4">
              {isLoadingCommunities ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Card key={i} className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : communityRankings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No community rankings available yet</p>
                </Card>
              ) : (
                <>
                  {communityRankings.map(community => (
                    <CommunityRankingCard key={community.id} {...community} />
                  ))}
                  {communityRankings.length >= 50 && (
                    <div className="text-center mt-6">
                      <Button variant="outline" size="lg">
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* User Rankings */}
            <TabsContent value="users" className="space-y-4">
              {isLoadingUsers ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Card key={i} className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : userRankings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No user rankings available yet</p>
                </Card>
              ) : (
                <>
                  {userRankings.map(user => (
                    <UserRankingCard key={user.address} {...user} />
                  ))}
                  {userRankings.length >= 50 && (
                    <div className="text-center mt-6">
                      <Button variant="outline" size="lg">
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

