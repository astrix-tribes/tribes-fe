import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Input, Badge } from '../components/common/ui';
import { ProposalCard } from '../components/governance/ProposalCard';
import { mockProposals } from '../data/mockProposals';
import type { ProposalStatus } from '../types/governance';

const tabs: ProposalStatus[] = ['active', 'passed', 'failed'];

export function Governance() {
  const [activeTab, setActiveTab] = useState<ProposalStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProposals = mockProposals.filter((proposal: any) => {
    const matchesTab = proposal.status === activeTab;
    const matchesSearch = searchQuery
      ? proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance</h1>
          <p className="text-muted-foreground">
            Vote on proposals to shape the future of the platform
          </p>
        </div>
        <Button leftIcon={<Plus className="w-5 h-5" />}>
          Create Proposal
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            variant="enhanced"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/10"
              >
                {mockProposals.filter((p: any) => p.status === tab).length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProposals.map((proposal: any) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            onClick={() => console.log('Navigate to proposal', proposal.id)}
          />
        ))}
        {filteredProposals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No proposals match your search'
                : 'No proposals in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 