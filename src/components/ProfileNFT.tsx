"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    InfoIcon,
    ImageIcon,
    RefreshCwIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    UserIcon,
    LinkIcon,
    PencilIcon,
    FileUpIcon
} from "lucide-react";
import { useHederaWallet } from "@/contexts/HederaWalletContext";

export default function NFTProfilePage() {
    // Form state
    const [name, setName] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [socialLink, setSocialLink] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("create");

    // NFT update state
    const [tokenId, setTokenId] = useState<string>("");
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Transaction state
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { accountId, isConnected } = useHederaWallet();

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset states when transaction completes
    const resetStates = () => {
        setTimeout(() => {
            setIsSuccess(false);
            setError(null);
            setTxHash(null);
        }, 5000);
    };

    // Handle create profile NFT via API
    const handleCreateProfile = async () => {
        try {
            setError(null);
            setIsPending(true);

            if (!accountId) {
                setError("Please connect your Hedera wallet first");
                return;
            }

            if (!name) {
                setError("Name is required");
                return;
            }

            if (!imageUrl) {
                setError("Profile image URL is required");
                return;
            }

            // Call API to mint Profile NFT
            const response = await fetch('/api/hedera/nft/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'PROFILE',
                    tokenId: process.env.NEXT_PUBLIC_PROFILE_NFT_TOKEN_ID,
                    params: {
                        username: name,
                        bio,
                        avatarUrl: imageUrl,
                        accountId,
                    },
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                setTxHash(data.data.txId);
                resetStates();
            } else {
                setError(data.error || 'Failed to create profile NFT');
            }
        } catch (err) {
            console.error("Error creating profile:", err);
            setError(err instanceof Error ? err.message : "Failed to create profile");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="container max-w-4xl py-12">
            <h1 className="text-4xl font-bold text-center mb-8 text-white bg-clip-text text-transparent">
                Mint your NFT Profile
            </h1>

            <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create New Profile</TabsTrigger>
                    <TabsTrigger value="manage">Manage Existing Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <Card className="border-slate-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Create Your NFT Profile</CardTitle>
                            <CardDescription>
                                Mint a unique NFT that represents your digital identity
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name *</Label>
                                    <div className="flex items-center">
                                        <UserIcon className="w-5 h-5 mr-2 text-slate-400" />
                                        <Input
                                            id="name"
                                            placeholder="Your display name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biography</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="socialLink">Social Media Link</Label>
                                    <div className="flex items-center">
                                        <LinkIcon className="w-5 h-5 mr-2 text-slate-400" />
                                        <Input
                                            id="socialLink"
                                            placeholder="https://twitter.com/yourusername"
                                            value={socialLink}
                                            onChange={(e) => setSocialLink(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Profile Image URL *</Label>
                                    <div className="flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-slate-400" />
                                        <Input
                                            id="imageUrl"
                                            placeholder="https://example.com/your-image.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enter a URL to your profile image (IPFS or other permanent storage recommended)
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Mint Price</Label>
                                    <div className="text-2xl font-bold">
                                        Free (Gas fees only)
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Hedera network fees (~$0.0001)
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {isSuccess && (
                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="text-green-800">Success!</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            Profile NFT created successfully!{" "}
                                            {txHash && (
                                                <a
                                                    href={`https://hashscan.io/testnet/transaction/${txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline font-medium"
                                                >
                                                    View on HashScan
                                                </a>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                size="lg"
                                onClick={handleCreateProfile}
                                disabled={!isConnected || isPending}
                            >
                                {isPending ? (
                                    <>
                                        <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Profile NFT...
                                    </>
                                ) : (
                                    <>Create NFT Profile</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="manage">
                    <Card className="border-slate-200 shadow-lg mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">Manage Your NFT Profile</CardTitle>
                            <CardDescription>
                                Profile management coming soon
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="text-center py-8">
                                <InfoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600">
                                    Profile NFT management features will be available soon.
                                    <br />
                                    You&apos;ll be able to update your profile information and image.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    Profile NFTs are minted on Hedera Token Service (HTS)
                    <br />
                    <a
                        href="https://hashscan.io/testnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                    >
                        View on HashScan
                    </a>
                </p>
            </div>
        </div>
    );
} 