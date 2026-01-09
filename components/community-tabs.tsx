"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharitableSection } from "@/components/charitable-section"
import { GiveawaysSection } from "@/components/giveaways-section"
import { HelpRequestsSection } from "@/components/help-requests-section"

interface CommunityTabsProps {
  charitableItems: any[]
  giveaways: any[]
  helpRequests: any[]
  userId: string | null
}

export function CommunityTabs({ charitableItems, giveaways, helpRequests, userId }: CommunityTabsProps) {
  return (
    <Tabs defaultValue="charitable" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="charitable">Charitable Giving</TabsTrigger>
        <TabsTrigger value="giveaways">Giveaways</TabsTrigger>
        <TabsTrigger value="help">Help & Advice</TabsTrigger>
      </TabsList>
      <TabsContent value="charitable" className="mt-6">
        <CharitableSection items={charitableItems} userId={userId} />
      </TabsContent>
      <TabsContent value="giveaways" className="mt-6">
        <GiveawaysSection items={giveaways} userId={userId} />
      </TabsContent>
      <TabsContent value="help" className="mt-6">
        <HelpRequestsSection items={helpRequests} userId={userId} />
      </TabsContent>
    </Tabs>
  )
}
